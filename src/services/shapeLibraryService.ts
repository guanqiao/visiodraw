import type { ShapeCategory, ShapeLibraryItem } from '../types/shapeLibrary'

// Import shape data
import { basicShapes } from '../data/shapeLibrary/basicShapes'
import { flowchartShapes } from '../data/shapeLibrary/flowchartShapes'
import { networkShapes } from '../data/shapeLibrary/networkShapes'
import { umlShapes } from '../data/shapeLibrary/umlShapes'
import { erShapes } from '../data/shapeLibrary/erShapes'
import { bpmnShapes } from '../data/shapeLibrary/bpmnShapes'
import { cloudShapes } from '../data/shapeLibrary/cloudShapes'

const categories: ShapeCategory[] = [
  basicShapes,
  flowchartShapes,
  networkShapes,
  umlShapes,
  erShapes,
  bpmnShapes,
  cloudShapes,
]

class ShapeLibraryService {
  private categories: ShapeCategory[]
  private shapeMap: Map<string, ShapeLibraryItem>

  constructor(categories: ShapeCategory[]) {
    this.categories = categories
    this.shapeMap = new Map()
    this.buildShapeMap()
  }

  private buildShapeMap() {
    this.categories.forEach((category) => {
      category.shapes.forEach((shape) => {
        this.shapeMap.set(shape.id, shape)
      })
    })
  }

  getAllCategories(): ShapeCategory[] {
    return this.categories
  }

  getCategoryById(id: string): ShapeCategory | undefined {
    return this.categories.find((cat) => cat.id === id)
  }

  getShapeById(id: string): ShapeLibraryItem | undefined {
    return this.shapeMap.get(id)
  }

  getAllShapes(): ShapeLibraryItem[] {
    return Array.from(this.shapeMap.values())
  }

  getShapesByCategory(categoryId: string): ShapeLibraryItem[] {
    const category = this.getCategoryById(categoryId)
    return category?.shapes || []
  }

  searchShapes(query: string): ShapeLibraryItem[] {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase()
    return this.getAllShapes().filter(
      (shape) =>
        shape.name.toLowerCase().includes(lowerQuery) ||
        shape.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
  }
}

export const shapeLibraryService = new ShapeLibraryService(categories)
export default shapeLibraryService
