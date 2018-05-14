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
const NES_HEADER_SIZE = 0x0010

const IsDebug = false

export class Nes {
  cpu: CPU
  ppu: PPU
  pad: Pad
  logger: Logger
  programROM: Uint8Array
  characterROM: Uint8Array
  renderer: Renderer

  constructor(nesBuffer: ArrayBuffer) {
    this.load(nesBuffer)

    this.logger = new Logger(IsDebug)
    this.ppu = new PPU(this.characterROM)
    const handler = new Handler(this.ppu, this.programROM, this.logger)
    this.cpu = new CPU(handler, this.logger)
    this.cpu.reset()
    this.pad = new Pad(handler);
    this.renderer = new Renderer()
  }

  load(nesBuffer) {
    const { programROM, characterROM } = this.parse(nesBuffer)

    this.programROM = programROM
    this.characterROM = characterROM
  }

  parse(rawBuffer) {
    const buf = new Uint8Array(rawBuffer)
    const characterROMStart = HeaderSize + buf[ProgramROMIndex] * 0x4000
    const characterROMEnd = characterROMStart + buf[ChacterROMIndex] * 0x2000

    return {
      programROM: buf.slice(NES_HEADER_SIZE, characterROMStart - 1),
      characterROM: buf.slice(characterROMStart, characterROMEnd - 1)
    }
  }

  run() {
    setInterval(() => {
      const cycle = this.cpu.run()
      const rendererInput = this.ppu.run(cycle * 3)
      if (rendererInput == null) return

      this.renderer.render(rendererInput)
    }, 1)
    // }, 33)
  }
}

// 1. Header (16 bytes)
// 2. Trainer, if present (0 or 512 bytes)
// 3. PRG ROM data (16384 * x bytes)
// 4. CHR ROM data, if present (8192 * y bytes)
// 5. PlayChoice INST-ROM, if present (0 or 8192 bytes)

// 4: Size of PRG ROM in 16 KB units
// 5: Size of CHR ROM in 8 KB units (Value 0 means the board uses CHR RAM)

// memory map
// address        size    purpose
// |------------||------||----------------|
// 0x0000～0x07FF	0x0800	WRAM
// 0x0800～0x1FFF	-	      WRAMのミラー
// 0x2000～0x2007	0x0008	PPU レジスタ
// 0x2008～0x3FFF	-	      PPUレジスタのミラー
// 0x4000～0x401F	0x0020	APU I/O、PAD
// 0x4020～0x5FFF	0x1FE0	拡張ROM
// 0x6000～0x7FFF	0x2000	拡張RAM
// 0x8000～0xBFFF	0x4000	PRG-ROM
// 0xC000～0xFFFF	0x4000	PRG-ROM
