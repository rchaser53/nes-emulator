import { convertIndexToRowColumn, createColorTileDef, createSpriteInputs, createBaseArrays } from './util'
import { Interrupt } from '../nes'

// 0x2000 - 0x2007
export interface PPURegister {
  PPUCTRL: number // コントロールレジスタ1	割り込みなどPPUの設定
  PPUMASK: number // コントロールレジスタ2	背景 enableなどのPPU設定
  PPUSTATUS: number // ppu status
  OAMADDR: number // スプライトメモリデータ	書き込むスプライト領域のアドレス
  OAMDATA: number // デシマルモード	スプライト領域のデータ
  PPUSCROLL: number // 背景スクロールオフセット	背景スクロール値
  PPUADDR: number // PPUメモリアドレス	書き込むPPUメモリ領域のアドレス
  PPUDATA: number // PPUメモリデータ	PPUメモリ領域のデータ
}

export interface VramAddressInfo {
  key: string
  address: number
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

const PreRenderLine = 8
const LineLimit = 261
const VBlankLine = 241
// const BoarderCycle = 341;
// const SpriteNumber = 100;

const DefaultPPUMASK = 0b00000000
const DefaultPPUCTRL = 0b01000000

const MaskBitsCondition = 0b11110;
const SpriteHitBiz = 0b100000;
const SpriteStartBottomBit = 0b10000000
const SpriteStartRightBit = 0b1000000
const PreferentialBackgroundBit = 0b100000
const nameTableBinaries = 0b11

const ColumnSpriteNumber = 32
const RowSpriteNumber = 30
const AttributeSpliteRowColumnNumber = 8;

export class PPU {
  isHorizontalMirror: boolean = false
  interrupt: Interrupt
  cycle: number = 0
  line: number = 0
  sprites: any[] = []
  spriteRamAddr: number = 0
  vRamAddr: number = 0
  vRamBaffer: number = 0x00
  isVramAddrUpper: boolean = true

  characteSpriteData: number[][]
  spriteRam: number[] = [...new Array(0x100)].fill(0)

  patternTables: number[][] = [
    [...new Array(0x1000)].fill(0),
    [...new Array(0x1000)].fill(0),
  ]

  nameTables: number[][] = [
    [...new Array(0x3c0)].fill(0),
    [...new Array(0x3c0)].fill(0),
    [...new Array(0x3c0)].fill(0),
    [...new Array(0x3c0)].fill(0),
  ]

  attributeTables: number[][] = [
    [...new Array(0x40)].fill(0),
    [...new Array(0x40)].fill(0),
    [...new Array(0x40)].fill(0),
    [...new Array(0x40)].fill(0),
  ]

  nameAttributeMirror: number[] = [...new Array(0xeff)].fill(0) //  $3000～$3EFF
  backgroundPalette: number[] = [...new Array(0x10)].fill(0)    //  $3F00～$3F0F
  spritePalette: number[] = [...new Array(0x10)].fill(0)        //  $3F10～$3F1F
  paletteMirror: number[] = [...new Array(0xd0)].fill(0)        //  $3F20～$3FFF

  colorTileBuffer: number[][] = []

  isHorizontal: boolean = true
  offSetX: number = 0
  offSetY: number = 0

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

  constructor(characterROM: Uint8Array, interrupt: Interrupt, isHorizontalMirror: boolean) {
    const sprites: any = []
    const characterArray = Array.from(characterROM)
    while (characterArray.length !== 0) {
      sprites.push(characterArray.splice(0, 16))
    }
    this.characteSpriteData = sprites
    this.interrupt = interrupt
    this.isHorizontalMirror = this.isHorizontalMirror
  }

  get offsetCharacteSpriteData() {
    const SpriteBaseBinary = 0b1000
    return (this.register.PPUCTRL & SpriteBaseBinary) === SpriteBaseBinary ? 0x1000 / 16 : 0
  }

  get currentTableIndex() {
    if (this.isHorizontalMirror) return 0
    return this.register.PPUCTRL & nameTableBinaries
  }

  get offsetAttributeTableXIndex() {
    return Math.floor(this.offSetX / ColumnSpriteNumber)
  }

  get offsetAttributeTableYIndex() {
    return Math.floor(this.offSetY / RowSpriteNumber)
  }

  get offsetNameTableXIndex() {
    return Math.floor(this.offSetX / AttributeSpliteRowColumnNumber)
  }

  get offsetNameTableYIndex() {
    return Math.floor(this.offSetY / AttributeSpliteRowColumnNumber)
  }

  get currentNameTable() {
    const nameTable = [...new Array(0x3c0)].fill(0)

    for (let column = 0; column < ColumnSpriteNumber; column++) {
      for (let row = 0; row < RowSpriteNumber; row++) {
        const baseX = (this.offsetNameTableXIndex + column) % ColumnSpriteNumber
        const baseY = ((this.offsetNameTableYIndex + row) % RowSpriteNumber) * ColumnSpriteNumber
        const targetIndex = baseX + baseY
        const nameTableIndex = column + (row * ColumnSpriteNumber)
        nameTable[nameTableIndex] = this.nameTables[this.currentTableIndex][targetIndex]
      }
    }
    return nameTable
  }

  get currentAttributeTable() {
    const attributeTable = [...new Array(0x40)].fill(0)
    for (let column = 0; column < AttributeSpliteRowColumnNumber; column++) {
      for (let row = 0; row < AttributeSpliteRowColumnNumber; row++) {
        const targetIndex = column + (row * AttributeSpliteRowColumnNumber)
        const attributeTableIndex = column + (row * AttributeSpliteRowColumnNumber)
        attributeTable[attributeTableIndex] = this.attributeTables[this.currentTableIndex][targetIndex]
      }
    }
    return attributeTable
  }

  read(index: number): number {
    switch (PPURegisterMap[index]) {
      case 'PPUSTATUS':
        this.isHorizontal = true
        return this.register.PPUSTATUS
      case 'PPUDATA':
        let ret
        const { key, address, index } = this.getTargetVram()
        switch (key) {
          case 'patternTables':
          case 'nameTables':
          case 'attributeTables':
            ret = this[key][index][address]
            break
          default:
            ret = this[key][address]
            break
        }
        this.moveNextVramAddr()
        return ret
      default:
        break
    }
    throw new Error(`should not come ${PPURegisterMap[index]}`)
  }

  write(index: number, value: number) {
    switch (PPURegisterMap[index]) {
      case 'PPUCTRL':
        this.register.PPUCTRL = value
        break
      case 'PPUMASK':
        this.register.PPUMASK = value
        break
      case 'OAMADDR':
        this.spriteRamAddr = value
        break
      case 'OAMDATA':
        this.spriteRam[this.spriteRamAddr] = value
        this.spriteRamAddr++
        break
      case 'PPUADDR':
        this.writeVRamAddress(value)
        break
      case 'PPUDATA':
        this.writePpuData(value)
        this.moveNextVramAddr()
        break
      case 'PPUSCROLL':
        this.writeScrollRegister(value)
        break
      case 'PPUSTATUS':
        this.register[PPURegisterMap[index]] = value
        break
      default:
        throw new Error(`should not come ${PPURegisterMap[index]}`)
    }
  }

  writeScrollRegister(value) {
    if (this.isHorizontal) {
      this.isHorizontal = false
      this.offSetX = value
    } else {
      this.isHorizontal = true
      this.offSetY = value
    }
  }

  writePpuData(value: number) {
    const { key, address, index } = this.getTargetVram()
    // Addresses $3F10/$3F14/$3F18/$3F1C are mirrors of $3F00/$3F04/$3F08/$3F0C
    // Note that this goes for writing as well as reading
    if (key === 'spritePalette') {
      if (address === 0x00 || address === 0x04 || address === 0x08 || address === 0x0c) {
        this.backgroundPalette[address] = value
        return
      }
    }

    switch (key) {
      case 'patternTables':
      case 'nameTables':
      case 'attributeTables':
        this[key][index][address] = value
        break
      default:
        this[key][address] = value
        break
    }
  }

  getTargetVram(): VramAddressInfo {
    const address = this.vRamAddr
    if (address < 0x1000) {
      return { key: 'patternTables', index: 0, address }
    } else if (address < 0x2000) {
      return { key: 'patternTables', index: 1, address: address - 0x1000 }
    } else if (address < 0x23c0) {
      return { key: 'nameTables', index: 0, address: address - 0x2000 }
    } else if (address < 0x2400) {
      return { key: 'attributeTables', index: 0, address: address - 0x23c0 }
    } else if (address < 0x27c0) {
      return { key: 'nameTables', index: 1, address: address - 0x2400 }
    } else if (address < 0x2800) {
      return { key: 'attributeTables', index: 1, address: address - 0x27c0 }
    } else if (address < 0x2bc0) {
      return { key: 'nameTables', index: 2, address: address - 0x2800 }
    } else if (address < 0x2c00) {
      return { key: 'attributeTables', index: 2, address: address - 0x2bc0 }
    } else if (address < 0x2fc0) {
      return { key: 'nameTables', index: 3, address: address - 0x2c00 }
    } else if (address < 0x3000) {
      return { key: 'attributeTables', index: 3, address: address - 0x2fc0 }
    } else if (address < 0x3f00) {
      return { key: 'nameAttributeMirror', index: 0, address: address - 0x3000 }
    } else if (address < 0x3f10) {
      return { key: 'backgroundPalette', index: 0, address: address - 0x3f00 }
    } else if (address < 0x3f20) {
      return { key: 'spritePalette', index: 0, address: address - 0x3f10 }
    } else if (address < 0x4000) {
      return { key: 'paletteMirror', index: 0, address: address - 0x3f20 }
    }
    throw new Error(`address '${address}' is too big {address}`)
  }

  moveNextVramAddr() {
    const AddressIncrementalModeBinary = 0b100
    this.vRamAddr += (this.register.PPUCTRL & AddressIncrementalModeBinary) === AddressIncrementalModeBinary ? 32 : 1
  }

  writeVRamAddress(value: number) {
    if (this.isVramAddrUpper === true) {
      this.vRamBaffer = value
    } else {
      this.vRamAddr = (this.vRamBaffer << 8) | value
    }
    this.isVramAddrUpper = !this.isVramAddrUpper
  }

  run(cycle: number) {
    this.cycle += cycle
    this.line++

    if (this.line === LineLimit) {
      this.colorTileBuffer = createColorTileDef(this.currentAttributeTable)

      this.line = 0
      this.register.PPUSTATUS ^= 0x80

      return {
        sprites: this.buildSprites(),
        background: this.buildBackground(),
        offSetX: this.offSetX,
        offSetY: this.offSetY
      }
    }

    if (this.line === VBlankLine) {
      this.register.PPUSTATUS |= 0x80
      this.interrupt.isNmi = true
      // const NmiBinary = 0b10000000
      // if ((this.register.PPUCTRL & NmiBinary) === NmiBinary) { }
    }

    return
  }

  buildSprites() {
    const sprites: any[] = []
    const baseArray = this.spriteRam.slice(0, this.spriteRam.length)
    while (baseArray.length !== 0) {
      sprites.push(baseArray.splice(0, 4))
    }

    return sprites.map((sprite: number[]) => {
      let upperColorBits = (sprite[2] >> 1) & 0b11
      if (this.isSpriteZero) {
        upperColorBits = 0
        this.register.PPUSTATUS ^= SpriteHitBiz;
      }

      const patternIndex = sprite[1] + this.offsetCharacteSpriteData
      return {
        x: sprite[3],
        y: sprite[0] - PreRenderLine,
        patternIndex,
        attribute: sprite[2],
        drawInfo: this.createSpliteDrawInfo(patternIndex, upperColorBits, sprite[2])
      }
    })
  }

  isSpriteZero(): boolean {
    return (this.register.PPUMASK & MaskBitsCondition) !== 0 && (this.register.PPUSTATUS & SpriteHitBiz) === SpriteHitBiz;
  }

  useBackgroundPalette(index: number, useBackground: boolean): boolean {
    return useBackground || index === 0x04 || index === 0x08 || index === 0x0c
  }

  createSpliteDrawInfo(spriteIndex: number, upperColorBits: number, attribute: number) {
    const sprite = createSpriteInputs(this.characteSpriteData[spriteIndex])
    const retSprites = createBaseArrays()
    const { startTop, startLeft, useBackground } = this.culculateAttribute(attribute)

    for (let row = 0; row < 8; row++) {
      for (let column = 0; column < 8; column++) {
        const actualRow = startTop ? row : 7 - row
        const actualColumn = startLeft ? 7 - column : column

        const paletteIndex = (upperColorBits << 2) | sprite[row][column]
        retSprites[actualRow][actualColumn] = this.useBackgroundPalette(paletteIndex, useBackground)
          ? this.backgroundPalette[paletteIndex]
          : this.spritePalette[paletteIndex]
      }
    }
    return retSprites
  }

  culculateAttribute(attribute: number) {
    return {
      startTop: ((attribute & SpriteStartBottomBit) === SpriteStartBottomBit) === false,
      startLeft: ((attribute & SpriteStartRightBit) === SpriteStartRightBit) === false,
      useBackground: (attribute & PreferentialBackgroundBit) === PreferentialBackgroundBit
    }
  }

  buildBackground() {
    return this.currentNameTable.map((elem, index) => {
      return this.createBackgroundSprite(elem, index)
    })
  }

  culculateInputIndex(nameIndex: number): number {
    const scrollX = Math.floor(this.offSetX / 8)
    const scrollY = Math.floor(this.offSetY / 8)
    return (nameIndex + scrollX + scrollY) % 960
  }

  createBackgroundSprite(characterIndex: number, nameIndex: number) {
    const inputIndex = this.culculateInputIndex(nameIndex)
    const { row, column } = convertIndexToRowColumn(inputIndex)
    const sprite = createSpriteInputs(this.characteSpriteData[characterIndex])

    return sprite.map((elem) => {
      return elem
        .map((num) => {
          const base = (this.colorTileBuffer[row][column] << 2) | num
          const paletteIndex = base === 0x04 || base === 0x08 || base === 0x0c ? 0x00 : base
          return this.backgroundPalette[paletteIndex]
        })
        .reverse()
    })
  }
}

// 描画されるべきスプライトのために、
// スプライトテンポラリレジスタとスプライトバッファレジスタが8スプライト分だけ存在します。
// あるラインにおいて次のラインで描画されるべきスプライトが見つかった場合、 スプライトテンポラリレジスタに保持されます。
// スプライトの探索の後、 スプライトテンポラリレジスタに基づいてスプライトバッファレジスタにスプライトのパターンがフェッチされます。
// このパターンデータが次のラインで描画されます。 またスプライト用レジスタの最初のスプライトはスプライト#0と呼ばれます。
// このスプライトがBG上に描画されるピクセルにおいて、ヒットフラグがセットされます。
// このヒットフラグの利用例として横スクロールゲームなどでは、
// ヒットするまでは横スクロール値を0として点数やタイムなどの情報を描画し、
// ヒットが検出されたら横スクロール値を設定してスクロールしたゲーム画面を描画しています。
