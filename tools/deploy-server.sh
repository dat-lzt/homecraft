#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_HOST="${DEPLOY_HOST:-lzt-v2}"
REMOTE_DIR="/opt/homecraft"
DEPLOY_TAG="$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"
BUILD_DIR="$(mktemp -d)"
cleanup() { rm -rf "$BUILD_DIR"; }
trap cleanup EXIT

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "Docker Desktop must be running to build the Homecraft image." >&2
  exit 1
fi
if ! command -v ssh >/dev/null 2>&1 || ! command -v scp >/dev/null 2>&1; then
  echo "ssh and scp are required." >&2
  exit 1
fi
ssh -o BatchMode=yes -o ConnectTimeout=10 "$REMOTE_HOST" true

bash "$ROOT_DIR/tools/build.sh"
cp "$ROOT_DIR/deploy/Dockerfile" "$BUILD_DIR/Dockerfile"
cp "$ROOT_DIR/deploy/nginx.conf" "$BUILD_DIR/nginx.conf"
cp "$ROOT_DIR/deploy/compose.yml" "$BUILD_DIR/compose.yml"
cp -R "$ROOT_DIR/dist" "$BUILD_DIR/dist"

docker build --platform linux/amd64 -t "homecraft:$DEPLOY_TAG" "$BUILD_DIR"
docker save "homecraft:$DEPLOY_TAG" | gzip > "$BUILD_DIR/image.tar.gz"
printf 'DEPLOY_TAG=%s\n' "$DEPLOY_TAG" > "$BUILD_DIR/.env"

ssh "$REMOTE_HOST" "sudo mkdir -p '$REMOTE_DIR'"
scp "$BUILD_DIR/image.tar.gz" "$BUILD_DIR/compose.yml" "$BUILD_DIR/.env" "$REMOTE_HOST:$REMOTE_DIR/"
ssh "$REMOTE_HOST" "set -e; cd '$REMOTE_DIR'; gzip -dc image.tar.gz | sudo docker load; sudo docker compose --env-file .env -f compose.yml up -d; rm -f image.tar.gz"

for attempt in $(seq 1 20); do
  if ssh "$REMOTE_HOST" "curl -fsS --max-time 5 http://127.0.0.1:3001/ >/dev/null"; then
    echo "Deployment succeeded: http://8.163.126.104:3001/"
    exit 0
  fi
  sleep 3
done
echo "Deployment started, but the HTTP health check failed." >&2
ssh "$REMOTE_HOST" "cd '$REMOTE_DIR' && sudo docker compose --env-file .env -f compose.yml logs --tail=80" >&2 || true
exit 1
