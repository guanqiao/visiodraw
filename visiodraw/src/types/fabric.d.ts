// Fabric.js 类型声明补充

import 'fabric'

declare module 'fabric' {
  export interface Canvas {
    setZoom(zoom: number): void
    getZoom(): number
    renderAll(): void
    clear(): void
    dispose(): void
    toDataURL(options?: { format?: string; quality?: number; multiplier?: number }): string
    toJSON(): unknown
    loadFromJSON(json: unknown, callback?: () => void): void
    backgroundColor: string
    selection: boolean
    isDrawingMode: boolean
    freeDrawingBrush: unknown
    on(event: string, handler: (e: unknown) => void): void
    off(event: string, handler: (e: