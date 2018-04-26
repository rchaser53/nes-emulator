import { convertDecimalToBoolArray, convertIndexToRowColumn, createColorTileDef, createSpliteInputs } from './util'

// 0x2000 - 0x2007
export interface PPURegister {
  PPUCTRL: ControlRegister // コントロールレジスタ1	割り込みなどPPUの設定
  PPUMASK: MaskRegister // コントロールレジスタ2	背景 enableなどのPPU設定
  PPUSTATUS: number // ppu status
  OAMADDR: number // スプライトメモリデータ	書き込むスプライト領域のアドレス
  OAMDATA: number // デシマルモード	スプライト領域のデータ
  PPUSCROLL: number // 背景スクロールオフセット	背景スクロール値
  PPUADDR: number // PPUメモリアドレス	書き込むPPUメモリ領域のアドレス
  PPUDATA: number // PPUメモリデータ	PPUメモリ領域のデータ
}

export interface ControlRegister {
  isEnableNmi: boolean // false: 無効  true: 有効
  masterslabe: true // 常時true
  isLargeSplite: boolean // false: 8x8  true: 8x16
  isBgBase: boolean // false: $0000  true: $1000
  isSpliteBase: boolean // false: $0000  true: $1000
  ppuAddressIncrementMode: boolean // false: +1, true: +32
  nameTableUpper: boolean // 00(false, false): $2000, 01(false, true): $2400
  nameTableLowwer: boolean // 10(true, false): $2800, 11(true, true): $2C00
}

export interface MaskRegister {
  bgColorFlag2: boolean // 背景色
  bgColorFlag1: boolean // 000:黒, 001:緑
  bgColorFlag0: boolean // 010:青, 100:赤
  isSpliteEnable: boolean // スプライト有効　0:無効、1:有効
  isBackgroundEnable: boolean // 背景有効　0:無効、1:有効
  spliteMask: boolean // スプライトマスク、画面左8ピクセルを描画しない。0:描画しない、1:描画
  backgroundMask: boolean // 背景マスク、画面左8ピクセルを描画しない。0:描画しない、1:描画
  isDisplayMono: boolean // ディスプレイタイプ　0:カラー、1:モノクロ
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
  7: 'PPUDATA'
}

const ControlRegisterMap = {
  0: 'isEnableNmi',
  1: 'masterslabe',
  2: 'isLargeSplite',
  3: 'isBgBase',
  4: 'OAMDATA',
  5: 'ppuAddressIncrementMode',
  6: 'nameTableUpper',
  7: 'nameTableLowwer'
}

const LineLimit = 262
const VBlankLine = 241;
// const BoarderCycle = 341;
// const DrawLine = 240;
// const SpriteNumber = 100;

const DefaultPPUCTRL: ControlRegister = {
  isEnableNmi: false,
  masterslabe: true,
  isLargeSplite: false,
  isBgBase: false,
  isSpliteBase: false,
  ppuAddressIncrementMode: false,
  nameTableUpper: false,
  nameTableLowwer: false
}

const DefaultPPUMASK: MaskRegister = {
  bgColorFlag2: false,
  bgColorFlag1: false,
  bgColorFlag0: false,
  isSpliteEnable: false,
  isBackgroundEnable: false,
  spliteMask: false,
  backgroundMask: false,
  isDisplayMono: false
}

export class PPU {
  cycle: number = 0
  line: number = 0
  background: any[] = []
  tileY: number
  sprites: any[] = []
  spriteRamAddr: number = 0
  vRamAddr: number = 0
  vRamBaffer: number = 0x00
  isVramAddrUpper: boolean = true

  characteSpliteData: number[][]
  spriteRam: Uint8Array = new Uint8Array(0x100)

  patternTable0: Uint8Array = new Uint8Array(0x1000) //  $0000～$0FFF
  patternTable1: Uint8Array = new Uint8Array(0x1000) //  $1000～$1FFF
  nameTable0: Uint8Array = new Uint8Array(0x3c0) //  $2000～$23BF
  attributeTable0: Uint8Array = new Uint8Array(0x40) //  $23C0～$23FF
  nameTable1: Uint8Array = new Uint8Array(0x3c0) //  $2400～$27BF
  attributeTable1: Uint8Array = new Uint8Array(0x40) //  $27C0～$27FF
  nameTable2: Uint8Array = new Uint8Array(0x3c0) //  $2800～$2BBF
  attributeTable2: Uint8Array = new Uint8Array(0x40) //  $2BC0～$2BFF
  nameTable3: Uint8Array = new Uint8Array(0x3c0) //  $2C00～$2FBF
  attributeTable3: Uint8Array = new Uint8Array(0x40) //  $2FC0～$2FFF

  nameAttributeMirror: Uint8Array = new Uint8Array(0xeff) //  $3000～$3EFF
  backgroundPallete: Uint8Array = new Uint8Array(0x10) //  $3F00～$3F0F
  splitePallete: Uint8Array = new Uint8Array(0x10) //  $3F10～$3F1F
  palleteMirror: Uint8Array = new Uint8Array(0xd0) //  $3F20～$3FFF

  colorTileDefs0: number[][] = []
  colorTileDefs1: number[][] = []
  colorTileDefs2: number[][] = []
  colorTileDefs3: number[][] = []

  register: PPURegister = {
    PPUCTRL: DefaultPPUCTRL,
    PPUMASK: DefaultPPUMASK,
    PPUSTATUS: 0x00,
    OAMADDR: 0x00,
    OAMDATA: 0x00,
    PPUSCROLL: 0x00,
    PPUADDR: 0x0000,
    PPUDATA: 0x00
  }

  constructor(characterROM: any) {
    const splites: any = []
    const characterArray = Array.from(characterROM)
    while (characterArray.length !== 0) {
      splites.push(characterArray.splice(0, 16))
    }
    this.characteSpliteData = splites
  }

  read(index: number): number {
    switch (PPURegisterMap[index]) {
      case 'PPUSTATUS':
        return this.register.PPUSTATUS
      case 'PPUDATA':
        const { key, index } = this.getTargetVram()
        const ret = this[key][index]
        this.moveNextVramAddr()
        return ret
      default:
        break
    }
    throw new Error(`should not come here! ${this}`)
  }

  write(index: number, value: number) {
    switch (PPURegisterMap[index]) {
      case 'PPUCTRL':
        this.writeBoolArrayRegister(value)
        break
      case 'PPUMASK':
        this.writeBoolArrayRegister(value)
        break
      case 'OAMADDR':
        this.spriteRamAddr = value
        break
      case 'OAMDATA':
        this.spriteRam[this.spriteRamAddr] = value
        break
      case 'PPUADDR':
        this.writeVRamAddress(value)
        break
      case 'PPUDATA':
        this.writePpuData(value)
        this.moveNextVramAddr()
        break
      case 'PPUSTATUS':
      case 'PPUSCROLL':
        this.register[PPURegisterMap[index]] = value
        break
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
    } else if (address < 0x23c0) {
      return { key: 'nameTable0', index: address - 0x2000 }
    } else if (address < 0x2400) {
      return { key: 'attributeTable0', index: address - 0x23c0 }
    } else if (address < 0x27c0) {
      return { key: 'nameTable1', index: address - 0x2400 }
    } else if (address < 0x2800) {
      return { key: 'attributeTable1', index: address - 0x27c0 }
    } else if (address < 0x2bc0) {
      return { key: 'nameTable2', index: address - 0x2800 }
    } else if (address < 0x2c00) {
      return { key: 'attributeTable2', index: address - 0x2bc0 }
    } else if (address < 0x2fc0) {
      return { key: 'nameTable3', index: address - 0x2c00 }
    } else if (address < 0x3000) {
      return { key: 'attributeTable3', index: address - 0x2fc0 }
    } else if (address < 0x3f00) {
      return { key: 'nameAttributeMirror', index: address - 0x3000 }
    } else if (address < 0x3f10) {
      return { key: 'backgroundPallete', index: address - 0x3f00 }
    } else if (address < 0x3f20) {
      return { key: 'splitePallete', index: address - 0x3f10 }
    } else if (address < 0x4000) {
      return { key: 'palleteMirror', index: address - 0x3f20 }
    }
    throw new Error(`address is too big {address}`)
  }

  writeBoolArrayRegister(value: number) {
    convertDecimalToBoolArray(value).forEach((bool, index) => {
      this.register.PPUCTRL[ControlRegisterMap[index]] = bool
    })
  }

  moveNextVramAddr() {
    this.vRamAddr += this.register.PPUCTRL.ppuAddressIncrementMode ? 32 : 1
  }

  writeVRamAddress(value: number) {
    if (this.isVramAddrUpper === true) {
      this.vRamBaffer = value
    } else {
      this.vRamAddr = (this.vRamBaffer << 8) | value
    }
    this.isVramAddrUpper = !this.isVramAddrUpper
  }

  getNameSpace(): number {
    const upper = this.register.PPUCTRL.nameTableUpper
    const lowwer = this.register.PPUCTRL.nameTableLowwer
    let base = 0x2000
    base += upper === true ? 0x0800 : 0
    base += lowwer === true ? 0x0400 : 0
    return base
  }

  run(cycle: number) {
    this.cycle += cycle
    this.line++

    if (this.line === LineLimit) {
      this.colorTileDefs0 = createColorTileDef(this.attributeTable0 as any)
      this.line = 0
      this.register.PPUSTATUS  &= 0x7F;

      return {
        background: this.buildBackground()
      }
    }

    if (VBlankLine <= this.line) {
      this.register.PPUSTATUS |= 0x80;
      if (this.register.PPUCTRL.isEnableNmi === true) {}
    }

    return
  }

  getTable(key: string): string {
    const { nameTableUpper, nameTableLowwer } = this.register.PPUCTRL
    const tableNumber = this.convertBoolToDecimal([nameTableUpper, nameTableLowwer])
    return `${key}${tableNumber}`
  }

  convertBoolToDecimal(bools: boolean[]): number {
    return bools.reduce((sum, next) => {
      sum += next === true ? 1 : 0
      return sum
    }, 0)
  }

  buildBackground() {
    const targetTable = this.getTable('nameTable')
    const names: number[] = Array.from(this[targetTable])
    return names.map((elem, index) => {
      return this.createColorSplite(elem, index)
    })
  }

  createColorSplite(characterIndex: number, nameIndex: number) {
    const { row, column } = convertIndexToRowColumn(nameIndex)
    const splite = createSpliteInputs(this.characteSpliteData[characterIndex])

    return splite.map((elem) => {
      return elem
        .map((num) => {
          const palleteIndex = (this.colorTileDefs0[row][column] << 2) | num
          return this.backgroundPallete[palleteIndex]
        })
        .reverse()
    })
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
