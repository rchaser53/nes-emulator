// 0x2000 - 0x2007
export interface PPURegister {
  PPUCTRL: ControlRegister,         // コントロールレジスタ1	割り込みなどPPUの設定
  PPUMASK: MaskRegister,            // コントロールレジスタ2	背景 enableなどのPPU設定
  PPUSTATUS: number,                // ppu status
  OAMADDR: number,                  // スプライトメモリデータ	書き込むスプライト領域のアドレス
  OAMDATA: number,                  // デシマルモード	スプライト領域のデータ
  PPUSCROLL: number,                // 背景スクロールオフセット	背景スクロール値
  PPUADDR: number,                  // PPUメモリアドレス	書き込むPPUメモリ領域のアドレス
  PPUDATA: number,                  // PPUメモリデータ	PPUメモリ領域のデータ
}

export interface ControlRegister {
  isEnableNmi: boolean,             // false: 無効  true: 有効
  masterslabe: true,                // 常時true
  isLargeSplite: boolean,           // false: 8x8  true: 8x16
  isBgBase: boolean,                // false: $0000  true: $1000
  isSpliteBase: boolean,            // false: $0000  true: $1000
  ppuAddressIncrementMode: boolean  // false: +1, true: +32
  nameTableUpper: boolean,          // 00(false, false): $2000, 01(false, true): $2400
  nameTableLowwer: boolean,         // 10(true, false): $2800, 11(true, true): $2C00
}

export interface MaskRegister {
  bgColorFlag2: boolean,            // 背景色
  bgColorFlag1: boolean,            // 000:黒, 001:緑
  bgColorFlag0: boolean,            // 010:青, 100:赤
  isSpliteEnable: boolean,          // スプライト有効　0:無効、1:有効
  isBackgroundEnable: boolean,      // 背景有効　0:無効、1:有効
  spliteMask: boolean,              // スプライトマスク、画面左8ピクセルを描画しない。0:描画しない、1:描画
  backgroundMask: boolean,          // 背景マスク、画面左8ピクセルを描画しない。0:描画しない、1:描画
  isDisplayMono: boolean,           // ディスプレイタイプ　0:カラー、1:モノクロ
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

const ControlRegisterMap = {
  0: 'isEnableNmi',
  1: 'masterslabe',
  2: 'isLargeSplite',
  3: 'isBgBase',
  4: 'OAMDATA',
  5: 'ppuAddressIncrementMode',
  6: 'nameTableUpper',
  7: 'nameTableLowwer',
}

const BoarderCycle = 341;
const DrawLine = 240;
// const SpriteNumber = 100;

const DefaultPPUCTRL: ControlRegister = {
  isEnableNmi: false,
  masterslabe: true,
  isLargeSplite: false,
  isBgBase: false,
  isSpliteBase: false,
  ppuAddressIncrementMode: false,
  nameTableUpper: false,
  nameTableLowwer: false,
}

const DefaultPPUMASK: MaskRegister = {
  bgColorFlag2: false,
  bgColorFlag1: false,
  bgColorFlag0: false,
  isSpliteEnable: false,
  isBackgroundEnable: false,
  spliteMask: false,
  backgroundMask: false,
  isDisplayMono: false,
}

export class PPU {
  cycle: number = 0
  line: number = 0
  background: any[] = []
  tileY: number
	vram: Uint8Array
	spriteRam: Uint8Array
	sprites: any[] = []
  spriteRamAddr: number = 0
  vRamAddr: number = 0
  vRamBaffer: number = 0x00
  isVramAddrUpper: boolean = true

  register: PPURegister = {
    PPUCTRL: DefaultPPUCTRL,
    PPUMASK: DefaultPPUMASK,
    PPUSTATUS: 0x00,
    OAMADDR: 0x00,
    OAMDATA: 0x00,
    PPUSCROLL: 0x00,
    PPUADDR: 0x0000,
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

  read(index: number): number {
    switch (PPURegisterMap[index]) {
      case 'PPUDATA':
        const ret = this.vram[this.vRamAddr];
        this.moveNextVramAddr();
        return ret;
      default:
        break;
    }
    throw new Error(`should not come here! ${this}`)
  }

  write(index: number, value: number) {
    switch (PPURegisterMap[index]) {
      case 'PPUCTRL':
        this.writeBoolArrayRegister(value);
      case 'PPUMASK':
        this.writeBoolArrayRegister(value);
      case 'OAMADDR':
        this.spriteRamAddr = value;
        break;
      case 'OAMDATA':
        this.spriteRam[this.spriteRamAddr] = value;
        break;
      case 'PPUADDR':
        this.writeVRamAddress(value)
        break;
      case 'PPUDATA':
        this.vram[this.vRamAddr] = value
        this.moveNextVramAddr()
        break;
      default:
        break;
    }
  }

  convertDecimalToBinary(decimal: number): number {
    const AllTrue8bit = 0b11111111
    return parseInt((decimal).toString(2), 2) & AllTrue8bit
  }
  
  isDegitTrue (binary: number, degit: number): boolean {
    const compare = 1 << (degit)
    return ((binary & compare) >> degit) === 1
  }

  convertDecimalToBoolArray(decimal: number): boolean[] {
    const binary = this.convertDecimalToBinary(decimal)
    let boolArray: boolean[] = []
    for (let i = 0; i < 8; i++) {
      boolArray.push(this.isDegitTrue(binary, i))
    }
    return boolArray
  }

  writeBoolArrayRegister(value: number) {
    this.convertDecimalToBoolArray(value).forEach((bool, index) => {
      this.register.PPUCTRL[ControlRegisterMap[index]] = bool
    })
  }

  moveNextVramAddr() {
    this.vRamAddr += (this.register.PPUCTRL.ppuAddressIncrementMode)
                        ? 32
                        : 1
  }

  writeVRamAddress(value: number) {
    if (this.isVramAddrUpper === true) {
      this.vRamBaffer = value;
    } else {
      this.vRamAddr = (this.vRamBaffer << 8) | value
    }
    this.isVramAddrUpper = !this.isVramAddrUpper
  }

  getNameSpace(): number {
    const upper = this.register.PPUCTRL.nameTableUpper
    const lowwer = this.register.PPUCTRL.nameTableLowwer
    let base = 0x2000
    base += (upper === true)
              ? 0x0800
              : 0
    base += (lowwer === true)
              ? 0x0400
              : 0
    return base
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