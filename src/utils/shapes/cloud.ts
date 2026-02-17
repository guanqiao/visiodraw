import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import {
  createServerPath,
  createCloudPath,
  createRouterPath,
  createSwitchPath,
  createFirewallPath,
  createDesktopPath,
  createLaptopPath,
  createWifiPath,
  createGlobePath,
} from '../shapeMath'

export const renderServer = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createServerPath(config.width, config.height)
  const dotR = Math.min(config.width, config.height) * 0.03
  const dotX = config.width * 0.15
  const dotY1 = config.height * 0.18
  const dotY2 = config.height * 0.5
  const dotY3 = config.height * 0.82

  const fullPath = `${path}
    M${dotX - dotR},${dotY1} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY1} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY1}
    M${dotX - dotR},${dotY2} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY2} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY2}
    M${dotX - dotR},${dotY3} A${dotR},${dotR} 0 1,1 ${dotX + dotR},${dotY3} A${dotR},${dotR} 0 1,1 ${dotX - dotR},${dotY3}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: fullPath,
      },
    },
  })
}

export const renderCloud = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCloudPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderRouter = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createRouterPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderSwitch = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createSwitchPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderFirewall = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createFirewallPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderDesktop = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createDesktopPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderLaptop = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createLaptopPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderWifi = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createWifiPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: 'none',
      },
    },
  })
}

export const renderGlobe = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createGlobePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const cloudRenderers = {
  server: renderServer,
  cloud: renderCloud,
  router: renderRouter,
  switch: renderSwitch,
  firewall: renderFirewall,
  desktop: renderDesktop,
  laptop: renderLaptop,
  wifi: renderWifi,
  globe: renderGlobe,
}
