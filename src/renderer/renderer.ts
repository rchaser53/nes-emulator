import { colors } from './colors'

export interface SpriteInfo {
  x: number,
  y: number,
  patternIndex: number,
  attribute: number,
  drawInfo: number[][]
}

const CanvasIdSelector = '#nes'

export class Renderer {
  ctx
  image

  constructor() {
    this.createCanvas()
  }

  createCanvas() {
    const canvas = window.document.querySelector(CanvasIdSelector) as HTMLCanvasElement
    this.ctx = canvas.getContext('2d')
    this.image = this.ctx.createImageData(256, 224);
  }

  render(renderInput) {
    this.renderBackground(renderInput.background)
    this.renderSprite(renderInput.sprites)

    this.ctx.putImageData(this.image, 0, 0)
  }

  renderBackground(background) {
    background.forEach((sprite, spriteIndex) => {
      sprite.forEach((row, rowIndex) => {
        row.forEach((pixel, pixelIndex) => {
          const { x, y } = this.culculateXandY(spriteIndex, rowIndex, pixelIndex)
          const baseIndex = (x * 4) + (y * 4 * 256)
          this.image.data[baseIndex] = colors[pixel][0]
          this.image.data[baseIndex + 1] = colors[pixel][1]
          this.image.data[baseIndex + 2] = colors[pixel][2]
          this.image.data[baseIndex + 3] = 0xff;

          if (224 < y) {
            return
          }
        })
      })
    })
  }

  renderSprite(sprites) {
    sprites.forEach((sprite: SpriteInfo, spriteIndex) => {
      sprite.drawInfo.forEach((row, rowIndex) => {
        row.forEach((pixel, pixelIndex) => {
          const x = pixelIndex + sprite.x;
          const y = rowIndex + sprite.y;

          const baseIndex = (x * 4) + (y * 4 * 256)
          this.image.data[baseIndex] = colors[pixel][0]
          this.image.data[baseIndex + 1] = colors[pixel][1]
          this.image.data[baseIndex + 2] = colors[pixel][2]
          this.image.data[baseIndex + 3] = 0xff;
        })
      })
    })
  }

  culculateXandY(spriteIndex: number, rowIndex: number, pixelIndex: number) {
    const baseY = Math.floor(spriteIndex / 32) * 8
    const baseX = spriteIndex < 32 ? spriteIndex * 8 : Math.floor(spriteIndex % 32) * 8

    return {
      x: baseX + pixelIndex,
      y: baseY + rowIndex
    }
  }
}
