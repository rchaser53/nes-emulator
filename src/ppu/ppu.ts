import {
  convertDecimalToBoolArray,
  createColorTileDef
} from './util';

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

export interface VramAddressInfo {
  key: string
  index: number
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

  characteSpliteData: number[][]
  patternTable0: Uint8Array = new Uint8Array(0x1000)        //  $0000～$0FFF
  patternTable1: Uint8Array = new Uint8Array(0x1000)        //  $1000～$1FFF
  nameTable0: Uint8Array = new Uint8Array(0x3c0)            //  $2000～$23BF
  attributeTable0: Uint8Array = new Uint8Array(0x40)        //  $23C0～$23FF
  nameTable1: Uint8Array = new Uint8Array(0x3c0)            //  $2400～$27BF
  attributeTable1: Uint8Array = new Uint8Array(0x40)        //  $27C0～$27FF
  nameTable2: Uint8Array = new Uint8Array(0x3c0)            //  $2800～$2BBF
  attributeTable2: Uint8Array = new Uint8Array(0x40)        //  $2BC0～$2BFF
  nameTable3: Uint8Array = new Uint8Array(0x3c0)            //  $2C00～$2FBF
  attributeTable3: Uint8Array = new Uint8Array(0x40)        //  $2FC0～$2FFF

  nameAttributeMirror: Uint8Array = new Uint8Array(0xEFF)   //  $3000～$3EFF
  backgroundPallete: Uint8Array = new Uint8Array(0x10)      //  $3F00～$3F0F
  splitePallete: Uint8Array = new Uint8Array(0x10)          //  $3F10～$3F1F
  palleteMirror: Uint8Array = new Uint8Array(0xD0)          //  $3F20～$3FFF

  colorTileDefs: number[][] = []

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

  constructor(characterROM: any) {
    const splites: any = [];
    const characterArray = Array.from(characterROM);
    while (characterArray.length !== 0) {
      splites.push(characterArray.splice(0, 16));
    }
    this.characteSpliteData = splites
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
      case 'PPUSTATUS':
        return this.register.PPUSTATUS;
      case 'PPUDATA':
        const { key, index } = this.getTargetVram()
        const ret = this[key][index];
        this.moveNextVramAddr();
        return ret;
      default:
        break;
    }
    throw new Error(`should not come here! ${this}`)
  }

  write(index: number, value: number) {
    console.log(index, value, 'nya-n', this)
    switch (PPURegisterMap[index]) {
      case 'PPUCTRL':
        this.writeBoolArrayRegister(value);
        break;
      case 'PPUMASK':
        this.writeBoolArrayRegister(value);
        break;
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
        this.writePpuData(value)
        this.moveNextVramAddr()
        break;
      case 'PPUSTATUS':
      case 'PPUSCROLL':
        this.register[PPURegisterMap[index]] = value;
        break;
      default:
        throw new Error(`should not come ${this}`)
    }
  }

  writePpuData(value: number) {
    const { key, index } = this.getTargetVram()
    this[key][index] = value
  }

  getTargetVram(): VramAddressInfo {
    const address = this.vRamAddr
    if (address < 0x1000) {
      return { key: 'patternTable0', index: address }
    } else if (address < 0x2000) {
      return { key: 'patternTable1', index: address - 0x1000 }
    } else if (address < 0x23C0) {
      return { key: 'nameTable0', index: address - 0x2000 }
    } else if (address < 0x2400) {
      return { key: 'attributeTable0', index: address - 0x23C0 }
    } else if (address < 0x27C0) {
      return { key: 'nameTable1', index: address - 0x2400 }
    } else if (address < 0x2800) {
      return { key: 'attributeTable1', index: address - 0x27C0 }
    } else if (address < 0x2BC0) {
      return { key: 'nameTable2', index: address - 0x2800 }
    } else if (address < 0x2C00) {
      return { key: 'attributeTable2', index: address - 0x2BC0 }
    } else if (address < 0x2FC0) {
      return { key: 'nameTable3', index: address - 0x2C00 }
    } else if (address < 0x3000) {
      return { key: 'attributeTable3', index: address - 0x2FC0 }
    } else if (address < 0x3F00) {
      return { key: 'nameAttributeMirror', index: address - 0x3000 }
    } else if (address < 0x3F10) {
      return { key: 'backgroundPallete', index: address - 0x3F00 }
    } else if (address < 0x3F20) {
      return { key: 'splitePallete', index: address - 0x3F10 }
    } else if (address < 0x4000) {
      return { key: 'palleteMirror', index: address - 0x3F20 }
    }
    throw new Error(`address is too big {address}`);
  }

  writeBoolArrayRegister(value: number) {
    convertDecimalToBoolArray(value).forEach((bool, index) => {
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
  createColorSplite(characterIndex: number, nameIndex: number) {
    const { row, column } = convertIndexToRowColumn(nameIndex)
    return this.characteSpliteData[characterIndex].map((elem) => {
      return this.colorTileDefs0[row][column] << 2 | elem;
    })
  }
}


// BG（Back Ground）は8×8のタイルパターンを32×30個配置することで、 256×240ピクセルの解像度を持ちます。 

// BG描画は、まずスキャン座標と設定されたスクロール値によって算出された座標を、
// 範囲内に持つネームテーブルから描画するパターンのアドレスIDをフェッチします。 
/* 15 */ 

// また、色情報として属性テーブルからデータをフェッチします。
/* 15 */ 

// 次にパターンアドレスIDに対応する下位パターンと上位パターンをフェッチします。
// パターンは上位ビットから描画され、 下位パターンと上位パターンの各ビットが有効なら、
// 色情報とパターンビットによりBGパレットから色が選択されます。

// パターンのいずれのビットも有効でなければ透過色となり、 スプライトパレットの$3F10の色が選択されます。

const addressId = 72 //スキャン座標と設定されたスクロール値によって算出された座標


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


// OAMADDR: 0
// OAMDATA: 0
// PPUADDR: 0
// PPUCTRL: OAMDATA: false
// isBgBase: false
// isEnableNmi: false
// isLargeSplite: false
// isSpliteBase: false
// masterslabe: false
// nameTableLowwer: false
// nameTableUpper: false
// ppuAddressIncrementMode: false

// PPUDATA: 0
// PPUMASK:
//   backgroundMask: false
//   bgColorFlag0: false
//   bgColorFlag1: false
//   bgColorFlag2: false
//   isBackgroundEnable: false
//   isDisplayMono: false
//   isSpliteEnable: false
//   spliteMask: false
// PPUSCROLL: 0
// PPUSTATUS: 0