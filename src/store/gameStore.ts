import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createRuntime, createToolReading, simulateTick } from '../engine/simulation'
import type {
  InstallationDefinition,
  InstallationRuntime,
  ToolType,
} from '../types/game'

type MissionStep =
  | 'ARRIVEE_SITE'
  | 'LOCALISATION_PANNE'
  | 'MESURES'
  | 'DIAGNOSTIC'
  | 'REPARATION'
  | 'TEST_FINAL'
  | 'VALIDATION'

interface PlayerPosition {
  x: number
  y: number
}

interface GameStore {
  installations: InstallationDefinition[]
  isLoaded: boolean
  unlockedLevel: number
  selectedLevel: number | null
  currentInstallationId: string | null
  runtime: InstallationRuntime | null
  selectedTool: ToolType
  missionStep: MissionStep
  playerPosition: PlayerPosition
  loadInstallations: () => Promise<void>
  startLevel: (level: number) => void
  setMissionStep: (step: MissionStep) => void
  tick: (dtSeconds: number) => void
  movePlayer: (dx: number, dy: number) => void
  toggleComponentOpen: (componentId: string) => void
  toggleComponentRun: (componentId: string) => void
  setRegulatorFanForcedOff: (forcedOff: boolean) => void
  setRegulatorDefrostActive: (active: boolean) => void
  setElectricalProbe: (probe: 'A' | 'B', pointId: string) => void
  triggerElectricalMeasurement: () => void
  activateFault: (faultId: string) => void
  setActiveFaults: (faultIds: string[]) => void
  repairFault: (faultId: string) => void
  setSelectedTool: (tool: ToolType) => void
  measureWithTool: () => void
  validateMission: () => void
}

const getCurrentDefinition = (state: GameStore) =>
  state.installations.find((item) => item.id === state.currentInstallationId)

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      installations: [],
      isLoaded: false,
      unlockedLevel: 1,
      selectedLevel: null,
      currentInstallationId: null,
      runtime: null,
      selectedTool: 'MANIFOLD',
      missionStep: 'ARRIVEE_SITE',
      playerPosition: { x: 180, y: 260 },

      loadInstallations: async () => {
        if (get().isLoaded) {
          return
        }

        const response = await fetch('/data/installations.json')
        const installations = (await response.json()) as InstallationDefinition[]

        set({
          installations,
          isLoaded: true,
        })
      },

      startLevel: (level: number) => {
        const state = get()
        if (level > state.unlockedLevel) {
          return
        }

        const definition = state.installations.find((item) => item.level === level)
        if (!definition) {
          return
        }

        set({
          selectedLevel: level,
          currentInstallationId: definition.id,
          runtime: createRuntime(definition),
          missionStep: 'ARRIVEE_SITE',
          playerPosition: { x: 160, y: 260 },
        })
      },

      setMissionStep: (step) => {
        set({ missionStep: step })
      },

      tick: (dtSeconds) => {
        const state = get()
        const definition = getCurrentDefinition(state)
        if (!definition || !state.runtime) {
          return
        }

        set({
          runtime: simulateTick(definition, state.runtime, dtSeconds),
        })
      },

      movePlayer: (dx, dy) => {
        const { playerPosition } = get()
        const x = Math.min(840, Math.max(40, playerPosition.x + dx))
        const y = Math.min(520, Math.max(60, playerPosition.y + dy))
        set({ playerPosition: { x, y } })
      },

      toggleComponentOpen: (componentId) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        const current = state.runtime.components[componentId]
        if (!current) {
          return
        }

        set({
          runtime: {
            ...state.runtime,
            components: {
              ...state.runtime.components,
              [componentId]: {
                ...current,
                open: !current.open,
              },
            },
          },
        })
      },

      toggleComponentRun: (componentId) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        const current = state.runtime.components[componentId]
        if (!current) {
          return
        }

        set({
          runtime: {
            ...state.runtime,
            components: {
              ...state.runtime.components,
              [componentId]: {
                ...current,
                running: !current.running,
              },
            },
          },
        })
      },

      setRegulatorFanForcedOff: (forcedOff) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        set({
          runtime: {
            ...state.runtime,
            regulator: {
              ...state.runtime.regulator,
              fanForcedOff: forcedOff,
            },
          },
        })
      },

      setRegulatorDefrostActive: (active) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        set({
          runtime: {
            ...state.runtime,
            regulator: {
              ...state.runtime.regulator,
              defrostActive: active,
            },
          },
        })
      },

      setElectricalProbe: (probe, pointId) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        const nextElectrical = {
          ...state.runtime.electrical,
          selectedProbeA:
            probe === 'A' ? pointId : state.runtime.electrical.selectedProbeA,
          selectedProbeB:
            probe === 'B' ? pointId : state.runtime.electrical.selectedProbeB,
        }

        const measuredVoltage =
          nextElectrical.selectedProbeA && nextElectrical.selectedProbeB
            ? Math.abs(
                (nextElectrical.testPointVoltage[nextElectrical.selectedProbeA] ?? 0) -
                  (nextElectrical.testPointVoltage[nextElectrical.selectedProbeB] ?? 0),
              )
            : null

        set({
          runtime: {
            ...state.runtime,
            electrical: {
              ...nextElectrical,
              measuredVoltage,
            },
          },
        })
      },

      triggerElectricalMeasurement: () => {
        const state = get()
        const definition = getCurrentDefinition(state)
        if (!state.runtime || !definition) {
          return
        }

        const lastReading = createToolReading('MULTIMETER', definition, state.runtime)

        set({
          selectedTool: 'MULTIMETER',
          missionStep: 'MESURES',
          runtime: {
            ...state.runtime,
            lastReading,
          },
        })
      },

      activateFault: (faultId) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        if (state.runtime.activeFaultIds.includes(faultId)) {
          return
        }

        set({
          runtime: {
            ...state.runtime,
            activeFaultIds: [...state.runtime.activeFaultIds, faultId],
          },
          missionStep: 'LOCALISATION_PANNE',
        })
      },

      setActiveFaults: (faultIds) => {
        const state = get()
        const definition = getCurrentDefinition(state)
        if (!definition) {
          return
        }

        const validFaultIds = faultIds.filter((faultId) =>
          definition.faults.some((fault) => fault.id === faultId),
        )

        const runtime = createRuntime(definition)
        runtime.activeFaultIds = [...validFaultIds]

        set({
          runtime,
          missionStep: validFaultIds.length > 0 ? 'LOCALISATION_PANNE' : 'ARRIVEE_SITE',
        })
      },

      repairFault: (faultId) => {
        const state = get()
        const definition = getCurrentDefinition(state)
        if (!state.runtime || !definition) {
          return
        }

        const repairedFault = definition.faults.find((fault) => fault.id === faultId)

        const nextComponents = { ...state.runtime.components }
        if (repairedFault) {
          for (const componentId of repairedFault.effects.powerCutComponentIds) {
            if (nextComponents[componentId]) {
              nextComponents[componentId] = {
                ...nextComponents[componentId],
                powered: true,
              }
            }
          }

          for (const componentId of repairedFault.effects.leakComponentIds) {
            if (nextComponents[componentId]) {
              nextComponents[componentId] = {
                ...nextComponents[componentId],
                leaking: false,
              }
            }
          }
        }

        set({
          runtime: {
            ...state.runtime,
            components: nextComponents,
            activeFaultIds: state.runtime.activeFaultIds.filter((id) => id !== faultId),
          },
          missionStep: 'REPARATION',
        })
      },

      setSelectedTool: (tool) => {
        set({ selectedTool: tool })
      },

      measureWithTool: () => {
        const state = get()
        const definition = getCurrentDefinition(state)
        if (!state.runtime || !definition) {
          return
        }

        const lastReading = createToolReading(state.selectedTool, definition, state.runtime)
        set({
          runtime: {
            ...state.runtime,
            lastReading,
          },
          missionStep: 'MESURES',
        })
      },

      validateMission: () => {
        const state = get()
        const definition = getCurrentDefinition(state)
        if (!state.runtime || !definition || state.selectedLevel === null) {
          return
        }

        const noFault = state.runtime.activeFaultIds.length === 0
        const stableTemp = state.runtime.thermo.boxTemp <= definition.base.boxTemp + 1.5

        if (!noFault || !stableTemp) {
          set({ missionStep: 'DIAGNOSTIC' })
          return
        }

        const nextUnlock = Math.max(state.unlockedLevel, state.selectedLevel + 1)
        set({
          missionStep: 'VALIDATION',
          unlockedLevel: Math.min(6, nextUnlock),
        })
      },
    }),
    {
      name: 'frigoriste-manager-save',
      partialize: (state) => ({
        unlockedLevel: state.unlockedLevel,
      }),
    },
  ),
)
