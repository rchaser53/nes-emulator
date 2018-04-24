import { colors } from './colors'

const CanvasIdSelector = '#nes'

export class Renderer {
  ctx
  image
  background
  vram: Uint8Array

  constructor() {
    this.createCanvas()
  }

  createCanvas() {
    const canvas = (window.document).querySelector(CanvasIdSelector) as HTMLCanvasElement
    this.ctx = canvas.getContext('2d');
  }

  // address         size      purpose
  //  $3F00～$3F0F	  $0010	    バックグラウンドパレット
  //  $3F10～$3F1F	  $0010	    スプライトパレット
  //  $3F20～$3FFF	  -         $3F00-$3F1Fのミラー×7
  read(address: number): number {
    if (address <= 0x3f00) {
      // should be implemented
      return this.vram[address]
    } else if (address <= 0x3f0f) {
      // background pallet
      return this.vram[address]
    } else if (address <= 0x3F1F) {
      // splite pallet
      return this.vram[address]
    } else if (address <= 0x3fff) {
      // $3F00-$3F1F mirror
      return this.vram[address]
    }
    throw new Error(`${address} is not implemented`)
  }

  render(renderInput) {
    renderInput.background.forEach((splite, spliteIndex) => {
      splite.forEach((row, rowIndex) => {
        row.forEach((pixel, pixelIndex) => {
          const red = colors[pixel][0];
          const green = colors[pixel][1];
          const blue = colors[pixel][2];
  
          const {x, y} = this.culculateXandY(spliteIndex, rowIndex, pixelIndex);
          this.ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

          if (224 < y) {
            return
          }

          this.ctx.fillRect(x, y, 1, 1);
        })
      });
    })
  }

  culculateXandY(spliteIndex: number, rowIndex: number, pixelIndex: number) {
    const baseY = Math.floor(spliteIndex / 32) * 8
    const baseX = (spliteIndex < 32)
                    ? spliteIndex * 8
                    : Math.floor(spliteIndex % 32) * 8
  
    return {
      x: baseX + pixelIndex,
      y: baseY + rowIndex,
    }
  }
}
