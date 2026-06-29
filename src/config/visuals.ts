import type { InstallationKind } from '../types/game'

const sceneByKind: Record<InstallationKind, string> = {
  DISPLAY_CASE_POSITIVE: '/assets/equipment/display-case-positive.png',
  DISPLAY_CASE_NEGATIVE: '/assets/background/store-aisle.png',
  COLD_ROOM_POSITIVE: '/assets/equipment/cold-room.png',
  COLD_ROOM_NEGATIVE: '/assets/equipment/cold-room-interior.png',
  RACK_POSITIVE: '/assets/background/machine-room.png',
  RACK_NEGATIVE: '/assets/background/machine-room.png',
}

const thumbnailByKind: Record<InstallationKind, string> = {
  DISPLAY_CASE_POSITIVE: '/assets/equipment/display-case-positive.png',
  DISPLAY_CASE_NEGATIVE: '/assets/background/store-aisle.png',
  COLD_ROOM_POSITIVE: '/assets/equipment/cold-room.png',
  COLD_ROOM_NEGATIVE: '/assets/equipment/cold-room-interior.png',
  RACK_POSITIVE: '/assets/background/freshmarket-entry.png',
  RACK_NEGATIVE: '/assets/background/machine-room.png',
}

export const getHomeBackground = () => '/assets/background/home-hangar.png'

export const getLevelBackground = (kind: InstallationKind) => sceneByKind[kind]

export const getLevelThumbnail = (kind: InstallationKind) => thumbnailByKind[kind]
