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

  render(data) {
    const { background, palette } = data;
    this.renderBackground(background, palette);
    this.ctx.putImageData(this.image, 0, 0);
  }

  renderBackground(background, palette) {
    this.background = background;
    for (let i = 0; i < background.length; i += 1) {
      const x = (i % 32) * 8;
      const y = ~~(i / 32) * 8;
      this.renderTile(background[i], x, y, palette);
    }
  }

  renderTile({ sprite, paletteId }, tileX, tileY, palette) {
    const { data } = this.image;
    for (let i = 0; i < 8; i = i + 1) {
      for (let j = 0; j < 8; j = j + 1) {
        const paletteIndex = paletteId * 4 + sprite[i][j];
        const colorId = palette[paletteIndex];
        const color = colors[colorId];
        const x = tileX + j;
        const y = tileY + i;
        if (x >= 0 && 0xFF >= x && y >= 0 && y < 224) {
          const index = (x + (y * 0x100)) * 4;
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
          data[index + 3] = 0xFF;
        }
      }
    }
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
}

