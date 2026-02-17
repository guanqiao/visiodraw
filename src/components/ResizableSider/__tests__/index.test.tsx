import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResizableSider } from '../index'

describe('ResizableSider', () => {
  const mockOnWidthChange = vi.fn()

  beforeEach(() => {
    mockOnWidthChange.mockClear()
  })

  it('should render children correctly', () => {
    render(
      <ResizableSider
        width={200}
        minWidth={100}
        maxWidth={400}
        side="left"
        onWidthChange={mockOnWidthChange}
      >
        <div data-testid="child">Test Content</div>
      </ResizableSider>
    )

    expect(screen.getByTestId('child')).toBeDefined()
    expect(screen.getByText('Test Content')).toBeDefined()
  })

  it('should apply correct width style', () => {
    const { container } = render(
      <ResizableSider
        width={250}
        minWidth={100}
        maxWidth={400}
        side="left"
        onWidthChange={mockOnWidthChange}
      >
        <div>Content</div>
      </ResizableSider>
    )

    const contentDiv = container.querySelector('[style*="width: 250px"]')
    expect(contentDiv).toBeDefined()
  })

  it('should render resize handle', () => {
    const { container } = render(
      <ResizableSider
        width={200}
        minWidth={100}
        maxWidth={400}
        side="left"
        onWidthChange={mockOnWidthChange}
      >
        <div>Content</div>
      </ResizableSider>
    )

    const resizeHandle = container.querySelector('.resize-handle')
    expect(resizeHandle).toBeDefined()
  })

  it('should call onWidthChange when dragging', () => {
    const { container } = render(
      <ResizableSider
        width={200}
        minWidth={100}
        maxWidth={400}
        side="left"
        onWidthChange={mockOnWidthChange}
      >
        <div>Content</div>
      </ResizableSider>
    )

    const resizeHandle = container.querySelector('.resize-handle')!
    
    fireEvent.mouseDown(resizeHandle, { clientX: 100 })
    fireEvent.mouseMove(document, { clientX: 150 })
    fireEvent.mouseUp(document)

    expect(mockOnWidthChange).toHaveBeenCalled()
  })

  it('should respect minWidth constraint', () => {
    const { container } = render(
      <ResizableSider
        width={200}
        minWidth={100}
        maxWidth={400}
        side="left"
        onWidthChange={mockOnWidthChange}
      >
        <div>Content</div>
      </ResizableSider>
    )

    const resizeHandle = container.querySelector('.resize-handle')!
    
    // Drag left to reduce width below minWidth
    fireEvent.mouseDown(resizeHandle, { clientX: 200 })
    fireEvent.mouseMove(document, { clientX: 50 }) // -150px delta
    fireEvent.mouseUp(document)

    // Should be clamped to minWidth (100)
    expect(mockOnWidthChange).toHaveBeenCalledWith(100)
  })

  it('should respect maxWidth constraint', () => {
    const { container } = render(
      <ResizableSider
        width={200}
        minWidth={100}
        maxWidth={400}
        side="left"
        onWidthChange={mockOnWidthChange}
      >
        <div>Content</div>
      </ResizableSider>
    )

    const resizeHandle = container.querySelector('.resize-handle')!
    
    // Drag right to increase width above maxWidth
    fireEvent.mouseDown(resizeHandle, { clientX: 200 })
    fireEvent.mouseMove(document, { clientX: 500 }) // +300px delta
    fireEvent.mouseUp(document)

    // Should be clamped to maxWidth (400)
    expect(mockOnWidthChange).toHaveBeenCalledWith(400)
  })

  it('should handle right side correctly', () => {
    const { container } = render(
      <ResizableSider
        width={200}
        minWidth={100}
        maxWidth={400}
        side="right"
        onWidthChange={mockOnWidthChange}
      >
        <div>Content</div>
      </ResizableSider>
    )

    const resizeHandle = container.querySelector('.resize-handle')!
    
    // For right side, dragging left increases width
    fireEvent.mouseDown(resizeHandle, { clientX: 200 })
    fireEvent.mouseMove(document, { clientX: 150 }) // -50px delta = +50 width
    fireEvent.mouseUp(document)

    expect(mockOnWidthChange).toHaveBeenCalledWith(250)
  })
})
