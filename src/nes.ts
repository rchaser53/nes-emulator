// init code should be implemented?
// http://wiki.nesdev.com/w/index.php/Init_code
import { CPU } from './cpu/cpu'
import { PPU } from './ppu/ppu'
import { Pad } from './pad/pad'
import { Logger } from './debug/logger'
import { Handler } from './handler'
import { Renderer } from './renderer/renderer'

const HeaderSize = 0x0010
const ProgramROMIndex = 4
const ChacterROMIndex = 5
const NesHeaderSize = 0x0010

const IsDebug = false

export interface Interrupt {
  isNmi: boolean
  isBrk: boolean
  isIrq: boolean
}

export class Nes {
  cpu: CPU
  ppu: PPU
  pad: Pad
  handler: Handler
  logger: Logger
  programROM: Uint8Array
  characterROM: Uint8Array
  workingROM: Uint8Array = new Uint8Array(0x2000)
  renderer: Renderer
  interrupt: Interrupt = {
    isNmi: false,
    isBrk: false,
    isIrq: false,
  }
  isHorizontalMirror: boolean = false

  constructor(nesBuffer: ArrayBuffer) {
    this.load(nesBuffer)

    this.logger = new Logger(IsDebug)
    this.ppu = new PPU(this.characterROM, this.interrupt, this.isHorizontalMirror)
    this.handler = new Handler(this.ppu, this.programROM, this.workingROM, this.logger)
    this.pad = new Pad(this.handler)
    this.renderer = new Renderer()

    this.cpu = new CPU(this.handler, this.interrupt, this.logger)
    this.cpu.reset()
  }

  load(nesBuffer) {
    const { programROM, characterROM, isHorizontalMirror } = this.parse(nesBuffer)

    this.programROM = programROM
    this.characterROM = characterROM

    // https://wiki.nesdev.com/w/index.php/INES#Flags_6
    this.isHorizontalMirror = isHorizontalMirror
  }

  parse(rawBuffer) {
    const buf = new Uint8Array(rawBuffer)
    const characterROMStart = HeaderSize + buf[ProgramROMIndex] * 0x4000
    const characterROMEnd = characterROMStart + buf[ChacterROMIndex] * 0x2000

    return {
      programROM: buf.slice(NesHeaderSize, characterROMStart - 1),
      characterROM: buf.slice(characterROMStart, characterROMEnd - 1),
      isHorizontalMirror: (buf[5] & 0b1) === 0b1
    }
  }

  run() {
    while (true) {
      const cycle = this.cpu.run()
      const rendererInput = this.ppu.run(cycle * 3)
      if (rendererInput == null) continue

      this.renderer.render(rendererInput)
      break
    }
    requestAnimationFrame(this.run.bind(this))
  }
}
