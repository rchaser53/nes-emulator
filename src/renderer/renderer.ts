import { colors } from './colors'

const CanvasIdSelector = '#nes'

export class Renderer {
  ctx

  constructor() {
    this.createCanvas()
  }

  createCanvas() {
    const canvas = window.document.querySelector(CanvasIdSelector) as HTMLCanvasElement
    this.ctx = canvas.getContext('2d')
  }

  render(renderInput) {
    renderInput.background.forEach((splite, spliteIndex) => {
      splite.forEach((row, rowIndex) => {
        row.forEach((pixel, pixelIndex) => {
          const red = colors[pixel][0]
          const green = colors[pixel][1]
          const blue = colors[pixel][2]

          const { x, y } = this.culculateXandY(spliteIndex, rowIndex, pixelIndex)
          this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`

          if (224 < y) {
            return
          }

          this.ctx.fillRect(x, y, 1, 1)
        })
      })
    })
  }

  culculateXandY(spliteIndex: number, rowIndex: number, pixelIndex: number) {
    const baseY = Math.floor(spliteIndex / 32) * 8
    const baseX = spliteIndex < 32 ? spliteIndex * 8 : Math.floor(spliteIndex % 32) * 8

    return {
      x: baseX + pixelIndex,
      y: baseY + rowIndex
    }
  }
}
