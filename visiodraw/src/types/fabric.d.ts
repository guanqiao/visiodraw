// Fabric.js 类型声明补充
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
/* eslint-disable @typescript-eslint/ban-types */

export {}

declare global {
  namespace fabric {
    interface Canvas {
      setZoom(zoom: number): void
      getZoom(): number
      renderAll(): void
      clear(): void
      dispose(): void
      toDataURL(options?: { format?: string; quality?: number; multiplier?: number }): string
      toJSON(): unknown
      loadFromJSON(json: unknown, callback?: () => void): void
      toSVG(): string
      backgroundColor: string
      selection: boolean
      isDrawingMode: boolean
      freeDrawingBrush: unknown
      on(event: string, handler: (e: unknown) => void): void
      off(event: string, handler: (e: unknown) => void): void
      add(...objects: Object[]): void
      remove(...objects: Object[]): void
      getActiveObject(): Object | null
      getActiveObjects(): Object[]
      discardActiveObject(): void
      setActiveObject(object: Object): void
      getObjects(): Object[]
      absolutePan(point: { x: number; y: number }): void
      relativePan(point: { x: number; y: number }): void
      getCenter(): { x: number; y: number }
      width: number
      height: number
      bringToFront(object: Object): void
      sendToBack(object: Object): void
      zoomToPoint(point: { x: number; y: number }, zoom: number): void
      getPointer(e: Event): { x: number; y: number }
    }

    interface Object {
      id?: string
      type?: string
      left: number
      top: number
      width: number
      height: number
      fill: string
      stroke: string
      strokeWidth: number
      angle: number
      scaleX: number
      scaleY: number
      selectable: boolean
      evented: boolean
      visible: boolean
      opacity: number
      set(options: unknown): void
      get(property: string): unknown
      toObject(): unknown
      clone(callback: (clone: Object) => void): void
      on(event: string, handler: (e: unknown) => void): void
      off(event: string, handler: (e: unknown) => void): void
    }

    interface Circle extends Object {
      radius: number
    }

    class Canvas {
      constructor(element: HTMLCanvasElement | string, options?: Record<string, unknown>)
    }

    class Rect {
      constructor(options?: Record<string, unknown>)
    }

    class Circle {
      constructor(options?: Record<string, unknown>)
    }

    class Triangle {
      constructor(options?: Record<string, unknown>)
    }

    class Line {
      constructor(points: number[], options?: Record<string, unknown>)
    }

    class Text {
      constructor(text: string, options?: Record<string, unknown>)
    }

    class Path {
      constructor(path: string | unknown[], options?: Record<string, unknown>)
    }

    class Group {
      constructor(objects: Object[], options?: Record<string, unknown>)
    }

    class ActiveSelection {
      constructor(objects: Object[], options?: { canvas?: Canvas })
    }
  }
}
