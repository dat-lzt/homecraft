import { buildIsland } from '@engine/world/terrain.js';
import { buildForest } from '@engine/world/landscape.js';
import { BoxBatch } from '@engine/world/blocks.js';
import * as THREE from 'three';
import { ISLAND, TREES } from './layout.js';

export function build({ grid, layer }) {
  buildIsland(grid, ISLAND, { surfaceAt: () => 'grass', corner: 10, wobble: 0 });
  grid.define('palace_stone', { tex: { all: 'travertine' }, merge: true, map: '#d6c9ad' });
  grid.define('palace_wall', { tex: { all: 'plaster' }, merge: true, map: '#e7dfce' });

  // Raised rectangular terrace and a centered, broad approach stair.
  grid.fill(-14, 0, -12, 15, 1, 10, 'palace_stone');
  grid.fill(-12, 1, -10, 13, 2, 8, 'palace_stone');
  grid.fill(-10, 2, -8, 11, 3, 6, 'palace_stone');
  grid.fill(-3, 0, 10, 4, 1, 12, 'palace_stone');
  grid.fill(-2, 1, 8, 3, 2, 10, 'palace_stone');
  grid.fill(-1, 2, 6, 2, 3, 8, 'palace_stone');

  // Single Ming-style hall: pale infill walls, open central entrance.
  grid.fill(-9, 3, -6, 10, 8, -5, 'palace_wall');
  grid.fill(-9, 3, -5, -8, 8, 4, 'palace_wall');
  grid.fill(9, 3, -5, 10, 8, 4, 'palace_wall');
  grid.fill(-9, 3, 4, -2, 8, 5, 'palace_wall');
  grid.fill(3, 3, 4, 10, 8, 5, 'palace_wall');
  // White stone balustrade around the terrace, interrupted at the stair.
  for (const x of [-11, -8, -5, 5, 8, 11]) grid.fill(x, 2, 8, x + 1, 3, 9, 'palace_stone');
  for (const z of [-8, -4, 0, 4]) {
    grid.fill(-12, 2, z, -11, 3, z + 1, 'palace_stone');
    grid.fill(12, 2, z, 13, 3, z + 1, 'palace_stone');
  }
  const B = new BoxBatch(layer);
  const planes = [];
  const hipRoof = (halfWidth, halfDepth, eaveY, rise, color) => {
    const ridgeHalf = halfDepth * 0.42;
    const points = [
      [-halfWidth, eaveY, -halfDepth], [halfWidth, eaveY, -halfDepth],
      [halfWidth, eaveY, halfDepth], [-halfWidth, eaveY, halfDepth],
      [0, eaveY + rise, -ridgeHalf], [0, eaveY + rise, ridgeHalf],
    ];
    const faces = [[0,4,5,3], [1,2,5,4], [0,1,4], [3,5,2]];
    const vertices = [];
    for (const face of faces) {
      for (let i = 1; i < face.length - 1; i++) {
        for (const index of [face[0], face[i], face[i + 1]]) vertices.push(...points[index]);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
    planes.push(mesh);
    // Thin fascia follows the eaves and ridge, replacing the flat voxel outline.
    B.box(0, eaveY - 0.08, -halfDepth, halfWidth * 2 + 0.35, 0.24, 0.34, { tex: 'black_metal' });
    B.box(0, eaveY - 0.08, halfDepth, halfWidth * 2 + 0.35, 0.24, 0.34, { tex: 'black_metal' });
    B.box(-halfWidth, eaveY - 0.08, 0, 0.34, 0.24, halfDepth * 2, { tex: 'black_metal' });
    B.box(halfWidth, eaveY - 0.08, 0, 0.34, 0.24, halfDepth * 2, { tex: 'black_metal' });
    B.box(0, eaveY + rise + 0.08, 0, 0.24, 0.18, ridgeHalf * 2 + 0.5, { tex: 'black_metal' });
  };
  // Faceted hip roofs create a clear Ming double-eave silhouette without a stack of flat slabs.
  hipRoof(13.8, 10.2, 8.2, 3.6, 0x283746);
  hipRoof(9.1, 6.6, 10.3, 3.0, 0x334253);
  const red = { tex: 'paint', tint: 0x8f2924 };
  const trim = { tex: 'paint', tint: 0xc7a65e };
  // Exposed red timber columns, including a clear pair framing the entrance.
  for (const z of [-5, -1, 3]) for (const x of [-8, -4, 4, 8]) {
    B.box(x, 3, z, 0.62, 5, 0.62, red);
    B.box(x, 7.85, z, 0.9, 0.18, 0.9, trim);
  }
  // Door leaves are shown folded back against the jambs, keeping the opening walkable.
  B.box(-2.65, 3.1, 4.35, 0.14, 2.8, 1.25, { tex: 'wood_panel' });
  B.box(2.65, 3.1, 4.35, 0.14, 2.8, 1.25, { tex: 'wood_panel' });
  // Fine gold roof-edge line and ridge cap emphasize the layered silhouette.
  // Side windows with muted warm lattice panels.
  for (const z of [-3, 1]) for (const x of [-8.5, 9.5]) {
    B.box(x, 4.5, z, 0.08, 1.4, 1.1, { tex: 'paint', tint: 0x5b302b });
    for (const dy of [-0.45, 0, 0.45]) B.box(x * 1.002, 4.5 + dy, z, 0.12, 0.055, 1.1, trim);
  }

  // Interior follows a ceremonial axis: a clear approach aisle leads to a
  // raised throne dais, while the side bays carry restrained furnishings.
  B.box(0, 3.02, 1.25, 2.5, 0.035, 5.2, { tex: 'paint', tint: 0x7d2827 });
  B.box(0, 3.06, 1.25, 0.12, 0.025, 5.0, trim);
  for (const x of [-1.05, 1.05]) B.box(x, 3.06, 1.25, 0.035, 0.025, 5.0, trim);

  // Three shallow steps and a broad platform lift the principal seat above the hall.
  B.box(0, 3.08, -2.35, 5.2, 0.22, 2.5, { tex: 'travertine' });
  B.box(0, 3.3, -3.05, 4.5, 0.22, 1.9, { tex: 'travertine' });
  B.box(0, 3.52, -3.75, 3.8, 0.22, 1.25, { tex: 'travertine' });
  B.box(0, 3.76, -3.88, 2.15, 0.16, 1.0, { tex: 'wood_panel', top: 'velvet' });
  // A high-backed lacquered throne with armrests and gold end caps.
  B.box(0, 3.92, -4.22, 1.65, 0.2, 0.78, { tex: 'velvet', tint: 0x762624 });
  B.box(0, 4.1, -4.58, 1.55, 1.45, 0.2, red);
  B.box(0, 5.48, -4.58, 1.8, 0.18, 0.26, trim);
  for (const x of [-0.95, 0.95]) {
    B.box(x, 3.92, -4.22, 0.2, 0.82, 0.82, red);
    B.box(x, 4.68, -4.22, 0.24, 0.16, 0.9, trim);
  }
  // Paired ceremonial lantern stands anchor the dais without narrowing the aisle.
  for (const x of [-5.8, 5.8]) {
    B.box(x, 3, -3.2, 0.62, 1.2, 0.62, { tex: 'travertine' });
    B.box(x, 4.2, -3.2, 0.86, 0.14, 0.86, trim);
    B.box(x, 4.34, -3.2, 0.38, 0.72, 0.38, { tex: 'paint', tint: 0xffd58a, emissive: 0.55 });
    B.box(x, 5.06, -3.2, 0.58, 0.12, 0.58, trim);
  }
  // Low side tables and screens frame the room while leaving generous movement space.
  for (const x of [-6.1, 6.1]) {
    for (const z of [-1.8, 1.3]) {
      B.box(x, 3.42, z, 1.9, 0.14, 0.72, { tex: 'wood_panel', top: 'wood_floor' });
      for (const side of [-0.72, 0.72]) B.box(x + side, 3.08, z, 0.12, 0.55, 0.58, red);
    }
    B.box(x, 3.05, -4.2, 1.4, 2.5, 0.18, { tex: 'wood_panel', tint: 0x65302b });
    for (const dx of [-0.42, 0, 0.42]) B.box(x + dx, 3.08, -4.08, 0.045, 2.42, 0.07, trim);
  }
  return { batches: { static: B }, planes, forest: buildForest(grid, layer, TREES) };
}
