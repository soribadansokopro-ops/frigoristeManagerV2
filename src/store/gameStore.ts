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

interface MissionSessionStats {
  level: number
  elapsedSeconds: number
  measurements: number
  repairs: number
  requiredRepairs: number
  score: number
  stars: 0 | 1 | 2 | 3
  rewardXp: number
  rewardCredits: number
  completed: boolean
}

interface GameStore {
  installations: InstallationDefinition[]
  isLoaded: boolean
  unlockedLevel: number
  totalXp: number
  totalCredits: number
  bestScoreByLevel: Record<number, number>
  selectedLevel: number | null
  currentInstallationId: string | null
  runtime: InstallationRuntime | null
  missionStats: MissionSessionStats | null
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
  setRegulatorSetpoint: (delta: number) => void
  acknowledgeAlarms: () => void
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

const computeStability = (definition: InstallationDefinition, runtime: InstallationRuntime) => {
  const boxTempMargin = definition.base.boxTemp + 1.5
  return runtime.thermo.boxTemp <= boxTempMargin
}

const computeMissionRewards = (level: number, stats: MissionSessionStats) => {
  const timeBonus = Math.max(0, 240 - stats.elapsedSeconds) * 2
  const repairBonus = stats.repairs * 120
  const efficiencyPenalty = Math.max(0, stats.measurements - 8) * 10
  const baseScore = 620 + level * 150
  const score = Math.max(320, Math.round(baseScore + timeBonus + repairBonus - efficiencyPenalty))

  const stars: 1 | 2 | 3 = score >= 1200 ? 3 : score >= 860 ? 2 : 1
  const rewardXp = 70 + level * 30 + stars * 35
  const rewardCredits = 130 + level * 60 + stars * 55

  return { score, stars, rewardXp, rewardCredits }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      installations: [],
      isLoaded: false,
      unlockedLevel: 1,
      totalXp: 0,
      totalCredits: 0,
      bestScoreByLevel: {},
      selectedLevel: null,
      currentInstallationId: null,
      runtime: null,
      missionStats: null,
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

        const runtime = createRuntime(definition)
        const defaultFaultId = definition.faults[0]?.id
        if (defaultFaultId) {
          const faultIndex = Math.floor(Math.random() * definition.faults.length)
          runtime.activeFaultIds = [definition.faults[faultIndex].id]
        }

        const requiredRepairs = runtime.activeFaultIds.length > 0 ? runtime.activeFaultIds.length : 1

        set({
          selectedLevel: level,
          currentInstallationId: definition.id,
          runtime,
          missionStats: {
            level,
            elapsedSeconds: 0,
            measurements: 0,
            repairs: 0,
            requiredRepairs,
            score: 0,
            stars: 0,
            rewardXp: 0,
            rewardCredits: 0,
            completed: false,
          },
          missionStep: defaultFaultId ? 'LOCALISATION_PANNE' : 'ARRIVEE_SITE',
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
          missionStats: state.missionStats
            ? {
                ...state.missionStats,
                elapsedSeconds: state.missionStats.elapsedSeconds + dtSeconds,
              }
            : null,
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

      setRegulatorSetpoint: (delta) => {
        const state = get()
        if (!state.runtime) {
          return
        }

        const nextSetpoint = Math.min(12, Math.max(-35, state.runtime.regulator.setpoint + delta))

        set({
          runtime: {
            ...state.runtime,
            regulator: {
              ...state.runtime.regulator,
              setpoint: nextSetpoint,
            },
          },
        })
      },

      acknowledgeAlarms: () => {
        const state = get()
        if (!state.runtime) {
          return
        }

        set({
          runtime: {
            ...state.runtime,
            alarms: [],
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
          missionStats: state.missionStats
            ? {
                ...state.missionStats,
                measurements: state.missionStats.measurements + 1,
              }
            : null,
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
          missionStats: state.selectedLevel
            ? {
                level: state.selectedLevel,
                elapsedSeconds: 0,
                measurements: 0,
                repairs: 0,
                requiredRepairs: validFaultIds.length > 0 ? validFaultIds.length : 1,
                score: 0,
                stars: 0,
                rewardXp: 0,
                rewardCredits: 0,
                completed: false,
              }
            : null,
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

        const nextActiveFaultIds = state.runtime.activeFaultIds.filter((id) => id !== faultId)

        set({
          runtime: {
            ...state.runtime,
            components: nextComponents,
            activeFaultIds: nextActiveFaultIds,
          },
          missionStats: state.missionStats
            ? {
                ...state.missionStats,
                repairs: state.missionStats.repairs + 1,
              }
            : null,
          missionStep: nextActiveFaultIds.length > 0 ? 'REPARATION' : 'TEST_FINAL',
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
          missionStats: state.missionStats
            ? {
                ...state.missionStats,
                measurements: state.missionStats.measurements + 1,
              }
            : null,
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

        if (state.missionStats?.completed || state.missionStep === 'VALIDATION') {
          return
        }

        const noFault = state.runtime.activeFaultIds.length === 0
        const stableTemp = computeStability(definition, state.runtime)

        if (!noFault) {
          set({ missionStep: 'DIAGNOSTIC' })
          return
        }

        if (!stableTemp) {
          set({ missionStep: 'TEST_FINAL' })
          return
        }

        const currentStats = state.missionStats ?? {
          level: state.selectedLevel,
          elapsedSeconds: 0,
          measurements: 0,
          repairs: 0,
          requiredRepairs: 1,
          score: 0,
          stars: 0 as 0,
          rewardXp: 0,
          rewardCredits: 0,
          completed: false,
        }

        const rewards = computeMissionRewards(state.selectedLevel, currentStats)
        const nextUnlock = Math.max(state.unlockedLevel, state.selectedLevel + 1)
        const bestForLevel = Math.max(state.bestScoreByLevel[state.selectedLevel] ?? 0, rewards.score)

        set({
          missionStep: 'VALIDATION',
          unlockedLevel: Math.min(6, nextUnlock),
          totalXp: state.totalXp + rewards.rewardXp,
          totalCredits: state.totalCredits + rewards.rewardCredits,
          bestScoreByLevel: {
            ...state.bestScoreByLevel,
            [state.selectedLevel]: bestForLevel,
          },
          missionStats: {
            ...currentStats,
            score: rewards.score,
            stars: rewards.stars,
            rewardXp: rewards.rewardXp,
            rewardCredits: rewards.rewardCredits,
            completed: true,
          },
        })
      },
    }),
    {
      name: 'frigoriste-manager-save',
      partialize: (state) => ({
        unlockedLevel: state.unlockedLevel,
        totalXp: state.totalXp,
        totalCredits: state.totalCredits,
        bestScoreByLevel: state.bestScoreByLevel,
      }),
    },
  ),
)
