// Fabric.js 类型声明补充
declare module 'fabric' {
  export interface Canvas {
    setZoom(zoom: number): void
    getZoom(): number
    renderAll(): void
    clear(): void
    dispose(): void
    toDataURL(options?: { format?: string; quality?: number }): string
    toJSON(): any
    loadFromJSON(json: any, callback?: () => void): void
    backgroundColor: string
    selection: boolean
    isDrawingMode: boolean
    freeDrawingBrush: any
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
    add(...objects: Object[]): void
    remove(...objects: Object[]): void
    getActiveObject(): Object | null
    getActiveObjects(): Object[]
    discardActiveObject(): void
    setActiveObject(object: Object): void
    getObjects(): Object[]
    absolutePan(point: Point): void
    relativePan(point: Point): void
    getCenter(): { x: number; y: number }
    width: number
    height: number
  }

  export interface Object {
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
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export interface Point {
    x: number
    y: number
  }

  export class Rect implements Object {
    constructor(options?: any)
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
    rx?: number
    ry?: number
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export class Circle implements Object {
    constructor(options?: any)
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
    radius: number
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export class Triangle implements Object {
    constructor(options?: any)
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
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export class Line implements Object {
    constructor(points: number[], options?: any)
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
    x1: number
    y1: number
    x2: number
    y2: number
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export class Text implements Object {
    constructor(text: string, options?: any)
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
    text: string
    fontSize: number
    fontFamily: string
    fontWeight: string | number
    textAlign: string
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export class Group implements Object {
    constructor(objects: Object[], options?: any)
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
    addWithUpdate(object: Object): void
    removeWithUpdate(object: Object): void
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }

  export class Path implements Object {
    constructor(path: string | any[], options?: any)
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
    path: any[]
    set(options: any): void
    get(property: string): any
    toObject(): any
    clone(callback: (clone: Object) => void): void
    on(event: string, handler: (e: any) => void): void
    off(event: string, handler: (e: any) => void): void
  }
}

declare global {
  interface Window {
    fabric: typeof import('fabric')
  }
}
