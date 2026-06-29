import type { InstallationDefinition } from '../types/game'

export interface MissionDescriptor {
  installation: string
  fault: string
}

export class MissionEngine {
  public buildMissionPayload(definition: InstallationDefinition, faultId: string): MissionDescriptor {
    return {
      installation: definition.id,
      fault: faultId,
    }
  }
}
