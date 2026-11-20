// 1 block = 1 m. x east, z south, y up.
export const ISLAND = { x0: -36, x1: 38, z0: -26, z1: 31 };
export const SPAWN = { x: 0.5, z: 17, heading: Math.PI };
export const INTRO = { pos: [30, 22, 37], portrait: [40, 28, 48], look: [0, 6, -1] };
export const STATIONS = [
  { id: 'about', name: '明代主殿', en: 'Ming Hall', at: [0.5, 5.8], look: [0.5, -1] },
  { id: 'works', name: '我的项目', en: 'Projects', at: [0.5, 1.8], look: [0.5, -4] },
  { id: 'mailbox', name: '留言', en: 'Mailbox', icon: 'mail', at: [0.5, 23.9], look: [0.5, 25.5] },
  { id: 'portal', name: '传送门', en: 'Portal', icon: 'portal', at: [8, 23.1], look: [8, 25.5] },
];
export const MAILBOX = { x: 0.5, z: 25.5, yaw: Math.PI };
export const PORTAL = { x: 8, z: 25.5, yaw: Math.PI };
export const TREES = [[-25,-14],[-22,-5],[-26,6],[24,-14],[27,-4],[25,7],[30,14],[-25,17]];
