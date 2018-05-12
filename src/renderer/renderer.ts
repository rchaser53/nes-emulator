import { colors } from './colors'

import { SpriteInfo } from '../ppu/ppu'

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
    this.renderBackground(renderInput.background);
    this.renderSprite(renderInput.sprites);
  }

  renderBackground(background) {
    background.forEach((sprite, spriteIndex) => {
      sprite.forEach((row, rowIndex) => {
        row.forEach((pixel, pixelIndex) => {
          const red = colors[pixel][0]
          const green = colors[pixel][1]
          const blue = colors[pixel][2]

          const { x, y } = this.culculateXandY(spriteIndex, rowIndex, pixelIndex)
          this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`

          if (224 < y) {
            return
          }

          this.ctx.fillRect(x, y, 1, 1)
        })
      })
    })
  }

  renderSprite(sprites) {
    sprites.forEach((sprite: SpriteInfo, spriteIndex) => {
      sprite.drawInfo.forEach((row, rowIndex) => {
        row.forEach((pixel, pixelIndex) => {
          const red = colors[pixel][0]
          const green = colors[pixel][1]
          const blue = colors[pixel][2]

          const x = pixelIndex + sprite.x;
          const y = rowIndex + sprite.y;

          this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`

          this.ctx.fillRect(x, y, 1, 1)
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
