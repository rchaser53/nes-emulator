// 0x2000 - 0x2007
export interface PPURegister {
  PPUCTRL: number,                  // コントロールレジスタ1	割り込みなどPPUの設定
  PPUMASK: number,                  // コントロールレジスタ2	背景 enableなどのPPU設定
  PPUSTATUS: number,                // ppu status
  OAMADDR: number,                  // スプライトメモリデータ	書き込むスプライト領域のアドレス
  OAMDATA: number,                  // デシマルモード	スプライト領域のデータ
  PPUSCROLL: number,                // 背景スクロールオフセット	背景スクロール値
  PPUADDR: number,                  // PPUメモリアドレス	書き込むPPUメモリ領域のアドレス
  PPUDATA: number,                  // PPUメモリデータ	PPUメモリ領域のデータ
}

const PPURegisterMap = {
  0: 'PPUCTRL',
  1: 'PPUMASK',
  2: 'PPUSTATUS',
  3: 'OAMADDR',
  4: 'OAMDATA',
  5: 'PPUSCROLL',
  6: 'PPUADDR',
  7: 'PPUDATA',
}

const BoarderCycle = 341;
const DrawLine = 240;
const SpriteNumber = 100;

export class PPU {
  cycle: number = 0
  line: number = 0
  background: any[] = []
  tileY: number
	vram: Uint8Array
	spriteRam: Uint8Array

  register: PPURegister = {
    PPUCTRL: 0x00,
    PPUMASK: 0x00,
    PPUSTATUS: 0x00,
    OAMADDR: 0x00,
    OAMDATA: 0x00,
    PPUSCROLL: 0x00,
    PPUADDR: 0x00,
    PPUDATA: 0x00,
  }
  constructor() {
		this.vram = new Uint8Array(0x4000)
		this.spriteRam = new Uint8Array(0x100);
  }

  getPalette(): any {

  }

  getSpriteId(tileX, tileY): number {
		return 0
  }

  getBlockId(tileX, tileY): number {
		return 0
  }

  getAttribute(tileX, tileY): number {
		return 0
  }

  readCharacterRAM(addr: number): number {
		return 0
  }

  writeRegister(index: number, value: number) {
    this.register[PPURegisterMap[index]] = value
  }

  readRegister(index: number): number {
    return this.register[PPURegisterMap[index]]
  }

  run(cycle: number){
    this.cycle += cycle;
    if(this.line === 0) {
			this.background.length = 0;
			this.buildSprites();
    }

    if (BoarderCycle <= this.cycle) {
      this.cycle -= BoarderCycle;
      this.line++;

      if (this.line <= DrawLine && this.line % 8 === 0) {
        this.buildBackground();
			}

      if (this.line === 262) {
        this.line = 0;
        return {
          background: this.background,
          palette: this.getPalette(),
        };
			}
		}
		return
  }

	buildSprites() {
		// TODO
	}

  buildSprite(spriteId) {
    const sprite = new Array(8).fill(0).map(() => [0, 0, 0, 0, 0, 0, 0, 0]);
    for (let i = 0; i < 16; i = i + 1) {
      for (let j = 0; j < 8; j = j + 1) {
        const addr = spriteId * 16 + i;
        const ram = this.readCharacterRAM(addr);
        if (ram & (0x80 >> j)) {
          sprite[i % 8][j] += 0x01 << ~~(i / 8);
        }
      }
    }
    return sprite;
  }

  buildTile(tileX, tileY) {
    const blockId = this.getBlockId(tileX, tileY); 
    const spriteId = this.getSpriteId(tileX, tileY); 
    const attr = this.getAttribute(tileX, tileY); 
    const paletteId = (attr >> (blockId * 2)) & 0x03; 
    const sprite = this.buildSprite(spriteId); 
    return { 
      sprite, 
      paletteId, 
    }; 
  } 

  buildBackground() { 
    const clampedTileY = this.tileY % 30; 
    for (let x = 0; x < 32; x = x + 1) {
      const clampedTileX = x % 32;
      // const nameTableId = (~~(x / 32) % 2);
      const tile = this.buildTile(clampedTileX, clampedTileY);
      this.background.push(tile);
    }
  }
}


// Initial Register Values
// Register	                          At Power	              After Reset
// PPUCTRL ($2000)	                    0000 0000	              0000 0000
// PPUMASK ($2001)	                    0000 0000	              0000 0000
// PPUSTATUS ($2002)	                  +0+x xxxx	              U??x xxxx
// OAMADDR ($2003)	                    $00	                    unchanged1
// $2005 / $2006 latch	                cleared	                cleared
// PPUSCROLL ($2005)	                  $0000	                  $0000
// PPUADDR ($2006)	                    $0000	                  unchanged
// PPUDATA ($2007) read buffer	        $00	                    $00
// odd frame	                          no	                    no
// OAM	                                pattern	                pattern
// NT RAM (external, in Control Deck)	  mostly $FF	            unchanged
// CHR RAM (external, in Game Pak)	    unspecified pattern	    unchanged