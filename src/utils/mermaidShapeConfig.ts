export const MERMAID_SHAPE_TYPE_MAP: Record<string, string> = {
  'stadium': 'mermaid-stadium',
  'cylinder': 'mermaid-cylinder',
  'hexagon': 'mermaid-hexagon',
  'parallelogram': 'mermaid-parallelogram-left',
  'parallelogram-l': 'mermaid-parallelogram-left',
  'parallelogram-r': 'mermaid-parallelogram-right',
  'trapezoid': 'mermaid-trapezoid-top',
  'trapezoid-top': 'mermaid-trapezoid-top',
  'trapezoid-bottom': 'mermaid-trapezoid-bottom',
  'subroutine': 'mermaid-subroutine',
  'circle': 'mermaid-circle',
  'doublecircle': 'mermaid-double-circle',
  'asymmetric': 'mermaid-asymmetric',
  'rhombus': 'mermaid-rhombus',
  'diamond': 'mermaid-rhombus',
  'rect': 'uml-action',
  'rectangle': 'uml-action',
  'roundrect': 'uml-initial',
  'cloud': 'mermaid-cloud',
  'banner': 'mermaid-banner',
  'document': 'mermaid-document',
  'delay': 'mermaid-delay',
  'lightning': 'mermaid-lightning',
  'lean-l': 'mermaid-lean-left',
  'lean-r': 'mermaid-lean-right',
  'divided': 'mermaid-divided-rect',
  'lined-doc': 'mermaid-lined-document',
  'stadium-end': 'mermaid-stadium-end',
  'label': 'mermaid-label-rect',
  'min-k': 'mermaid-kanban',
  'max-k': 'mermaid-kanban',
  'internal-l': 'mermaid-internal-left',
  'internal-r': 'mermaid-internal-right',
  'priority': 'mermaid-priority',
  'card': 'mermaid-card',
  'notch-rect': 'mermaid-notch-rect',
  'bolt': 'mermaid-bolt',
  'brace': 'mermaid-brace',
  'brace-l': 'mermaid-brace-left',
  'brace-r': 'mermaid-brace-right',
  'collate': 'mermaid-collate',
  'display': 'mermaid-display',
  'extract': 'mermaid-extract',
  'loop': 'mermaid-loop-limit',
  'manual-input': 'mermaid-manual-input',
  'multi-doc': 'mermaid-multi-document',
  'multi-proc': 'mermaid-multi-process',
  'odd': 'mermaid-odd',
  'prep': 'mermaid-preparation',
  'proc': 'mermaid-process',
  'stored-data': 'mermaid-stored-data',
  'summing-junction': 'mermaid-summing-junction',
  'tagged-rect': 'mermaid-tagged-rect',
  'text': 'mermaid-text',
  'wave-rect': 'mermaid-wave-rect',
}

export const MERMAID_BRACKET_TYPE_MAP: Record<string, string> = {
  '(': 'uml-initial',
  '([': 'mermaid-stadium',
  '{': 'mermaid-rhombus',
  '(((': 'mermaid-double-circle',
  '>': 'mermaid-asymmetric',
  '[/': 'mermaid-parallelogram-left',
  '[\\': 'mermaid-parallelogram-right',
  '((': 'mermaid-circle',
  '[[': 'mermaid-subroutine',
  '[(]': 'mermaid-cylinder',
  '{{': 'mermaid-hexagon',
}

export const MERMAID_EDGE_STYLE_MAP: Record<string, {
  style: 'straight' | 'orthogonal' | 'curved' | 'bezier'
  lineStyle: 'solid' | 'dashed'
  startMarker?: string
  endMarker?: string
}> = {
  '-->': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'arrow' },
  '---': { style: 'orthogonal', lineStyle: 'solid' },
  '-.->': { style: 'curved', lineStyle: 'dashed', endMarker: 'arrow' },
  '.->': { style: 'curved', lineStyle: 'dashed', endMarker: 'arrow' },
  '==>': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'arrow', startMarker: 'arrow' },
  '<-->': { style: 'orthogonal', lineStyle: 'solid', startMarker: 'arrow', endMarker: 'arrow' },
  '~~~': { style: 'orthogonal', lineStyle: 'dashed' },
  '---o': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'circle' },
  'o---': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'circle' },
  '---x': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'cross' },
  'x---': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'cross' },
  '--o': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'circle' },
  'o--': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'circle' },
  '--x': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'cross' },
  'x--': { style: 'orthogonal', lineStyle: 'solid', endMarker: 'cross' },
  '-.x': { style: 'curved', lineStyle: 'dashed', endMarker: 'cross' },
  'x.-': { style: 'curved', lineStyle: 'dashed', endMarker: 'cross' },
  '-.o': { style: 'curved', lineStyle: 'dashed', endMarker: 'circle' },
  'o.-': { style: 'curved', lineStyle: 'dashed', endMarker: 'circle' },
}

export const DEFAULT_NODE_TYPE = 'uml-action'
export const DEFAULT_EDGE_STYLE = { style: 'orthogonal' as const, lineStyle: 'solid' as const, endMarker: 'arrow' }

export function getMermaidShapeType(shapeName: string): string {
  return MERMAID_SHAPE_TYPE_MAP[shapeName.toLowerCase()] || DEFAULT_NODE_TYPE
}

export function getMermaidBracketType(bracket: string): string | undefined {
  return MERMAID_BRACKET_TYPE_MAP[bracket]
}

export function getMermaidEdgeStyle(arrowType: string): {
  style: 'straight' | 'orthogonal' | 'curved' | 'bezier'
  lineStyle: 'solid' | 'dashed'
  startMarker?: string
  endMarker?: string
} {
  return MERMAID_EDGE_STYLE_MAP[arrowType] || DEFAULT_EDGE_STYLE
}
