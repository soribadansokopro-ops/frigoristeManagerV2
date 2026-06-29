import { Application, Container, Graphics, Text } from 'pixi.js'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import type { InstallationDefinition, InstallationRuntime } from '../types/game'

interface GameViewportProps {
  installation: InstallationDefinition
  runtime: InstallationRuntime
  backgroundImage: string
  onOpenMeuble: () => void
}

export function GameViewport({ installation, runtime, backgroundImage, onOpenMeuble }: GameViewportProps) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<Application | null>(null)

  const toggleComponentOpen = useGameStore((state) => state.toggleComponentOpen)
  const toggleComponentRun = useGameStore((state) => state.toggleComponentRun)
  const playerPosition = useGameStore((state) => state.playerPosition)
  const tSuction = runtime.thermo.tSuction ?? runtime.thermo.tEvap + runtime.thermo.superheat
  const tDischarge = runtime.thermo.tDischarge ?? runtime.thermo.tCond + 30

  const evaporator = installation.components.find((component) => component.kind === 'evaporator')
  const evaporatorState = evaporator ? runtime.components[evaporator.id] : null
  const hasIcingClue = Boolean(
    (evaporatorState?.leaking || runtime.alarms.some((alarm) => alarm.toUpperCase().includes('GIVR'))) &&
      runtime.thermo.boxTemp > runtime.regulator.setpoint + 1.5,
  )
  const hasCondenserHeatClue = runtime.thermo.condenserApproach > 14 || runtime.thermo.hp > 16
  const hasElectricalFaultClue = !runtime.thermo.electricalPower

  useEffect(() => {
    const host = hostRef.current
    if (!host) {
      return
    }

    let cancelled = false
    let initialized = false
    let canvasEl: HTMLCanvasElement | null = null
    const app = new Application()

    void app.init({
      width: 980,
      height: 340,
      antialias: true,
      backgroundAlpha: 0,
    }).then(() => {
      initialized = true

      if (cancelled || !hostRef.current) {
        app.destroy(true)
        return
      }

      canvasEl = app.canvas
      host.appendChild(canvasEl)
      appRef.current = app
    }).catch(() => {
      initialized = false
    })

    return () => {
      cancelled = true

      if (appRef.current === app) {
        appRef.current = null
      }

      if (initialized) {
        app.destroy(true)
      }

      if (canvasEl && host.contains(canvasEl)) {
        host.removeChild(canvasEl)
      }

      appRef.current = null
    }
  }, [])

  useEffect(() => {
    const app = appRef.current
    if (!app) {
      return
    }

    app.stage.removeChildren()

    const scene = new Graphics()
    scene.roundRect(0, 0, 980, 340, 12)
    scene.fill({ color: 0x061329 })
    scene.roundRect(20, 24, 420, 200, 8)
    scene.fill({ color: 0x0d2747 })
    scene.roundRect(462, 24, 500, 200, 8)
    scene.fill({ color: 0x101a2e })
    scene.roundRect(20, 244, 942, 78, 8)
    scene.fill({ color: 0x08101d })
    app.stage.addChild(scene)

    const flow = new Graphics()
    flow.roundRect(46, 272, 890 * runtime.thermo.flowRatio, 20, 8)
    flow.fill({ color: 0x0f9fff })
    app.stage.addChild(flow)

    const visibleComponents = installation.components.slice(0, 8)
    visibleComponents.forEach((component, index) => {
      const x = 52 + (index % 4) * 228
      const y = index < 4 ? 48 : 144
      const componentState = runtime.components[component.id]

      const node = new Container()
      node.x = x
      node.y = y
      node.eventMode = 'static'
      node.cursor = 'pointer'

      const card = new Graphics()
      card.roundRect(0, 0, 204, 70, 8)
      card.fill({ color: componentState?.running ? 0x154070 : 0x1a2233 })
      card.stroke({ color: componentState?.running ? 0x28b8ff : 0x4d5d78, width: 2 })
      card.eventMode = 'static'
      card.cursor = 'pointer'

      const nameLabel = new Text({
        text: component.name,
        style: { fill: 0xdaf4ff, fontSize: 13, fontFamily: 'Bahnschrift, Segoe UI' },
      })
      nameLabel.x = 10
      nameLabel.y = 12

      const stateLabel = new Text({
        text: `${componentState?.powered ? 'ALIM' : 'OFF'} | ${componentState?.running ? 'RUN' : 'STOP'}`,
        style: {
          fill: componentState?.powered ? 0x4ef9a5 : 0xffb96c,
          fontSize: 11,
          fontFamily: 'Bahnschrift, Segoe UI',
        },
      })
      stateLabel.x = 10
      stateLabel.y = 40

      const leakLabel = new Text({
        text: componentState?.leaking ? 'INDICE: FUITE/GIVRE' : '',
        style: {
          fill: 0x95d8ff,
          fontSize: 9,
          fontFamily: 'Bahnschrift, Segoe UI',
        },
      })
      leakLabel.x = 10
      leakLabel.y = 56

      card.on('pointertap', () => {
        toggleComponentRun(component.id)
      })
      node.on('pointertap', () => {
        toggleComponentOpen(component.id)
      })

      node.addChild(card, nameLabel, stateLabel, leakLabel)
      app.stage.addChild(node)
    })

    if (hasIcingClue) {
      const frost = new Graphics()
      frost.ellipse(710, 160, 170, 66)
      frost.fill({ color: 0x9adfff, alpha: 0.22 })
      frost.ellipse(710, 160, 145, 50)
      frost.fill({ color: 0xc9f0ff, alpha: 0.16 })
      app.stage.addChild(frost)

      const frostHint = new Text({
        text: 'Indice visuel: zone evaporateur givree',
        style: { fill: 0xc8ecff, fontSize: 11, fontFamily: 'Bahnschrift, Segoe UI' },
      })
      frostHint.x = 592
      frostHint.y = 214
      app.stage.addChild(frostHint)
    }

    if (hasCondenserHeatClue) {
      const heat = new Graphics()
      heat.ellipse(274, 88, 140, 50)
      heat.fill({ color: 0xff8d4a, alpha: 0.18 })
      app.stage.addChild(heat)
    }

    if (hasElectricalFaultClue) {
      const warning = new Graphics()
      warning.roundRect(20, 12, 280, 24, 6)
      warning.fill({ color: 0x701f2f, alpha: 0.9 })
      app.stage.addChild(warning)

      const warningText = new Text({
        text: 'Indice: alimentation electrique instable',
        style: { fill: 0xffc5cc, fontSize: 11, fontFamily: 'Bahnschrift, Segoe UI' },
      })
      warningText.x = 28
      warningText.y = 18
      app.stage.addChild(warningText)
    }

    const player = new Graphics()
    player.circle(playerPosition.x, playerPosition.y, 10)
    player.fill({ color: 0x29e7a3 })
    player.circle(playerPosition.x, playerPosition.y, 18)
    player.stroke({ color: 0x29e7a3, width: 2 })
    app.stage.addChild(player)

    const playerLabel = new Text({
      text: 'TECH',
      style: { fill: 0xa0ffd7, fontSize: 10, fontFamily: 'Bahnschrift, Segoe UI' },
    })
    playerLabel.x = playerPosition.x - 14
    playerLabel.y = playerPosition.y + 20
    app.stage.addChild(playerLabel)
  }, [installation.components, playerPosition, runtime, toggleComponentOpen, toggleComponentRun])

  return (
    <section className="viewport-card">
      <header>
        <h3>Zone d intervention - rendu PixiJS</h3>
        <span>
          Debit frigorifique: {(runtime.thermo.flowRatio * 100).toFixed(0)}% | Intensite: {runtime.thermo.compressorCurrent.toFixed(1)} A | Tasp: {tSuction.toFixed(1)} C | Tref: {tDischarge.toFixed(1)} C
        </span>
      </header>
      <div className="pixi-stage-layer" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div ref={hostRef} className="pixi-stage-host" />
        <button
          type="button"
          className="viewport-hotspot meuble-hotspot"
          onClick={onOpenMeuble}
          aria-label="Ouvrir la page meuble"
        >
          Ouvrir meuble
        </button>
      </div>
    </section>
  )
}
