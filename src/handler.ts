import { PPU } from './ppu/ppu'
import { Logger } from './debug/logger'

export type Pad = 'pad1' | 'pad2'

export class Handler {
  ppu: PPU
  programMemory: Uint8Array
  workingMemory: Uint8Array
  logger: Logger
  pad1 = {
    memory: [0, 0, 0, 0, 0, 0, 0, 0],
    index: 0
  }
  pad2 = {
    memory: [0, 0, 0, 0, 0, 0, 0, 0],
    index: 0
  }

  constructor(ppu: PPU, programRam: Uint8Array, workingRam: Uint8Array, logger?: Logger) {
    this.ppu = ppu
    this.programMemory = programRam
    this.workingMemory = workingRam
    this.logger = logger || new Logger(false)
  }

  writePadMemory(key: Pad, value) {
    if (Array.isArray(value) === true) {
      this[key].memory = value
    } else {
      this[key].index = 0
    }
  }

  readPadMemory(key: Pad) {
    const value = this[key].memory[this[key].index]
    this[key].index = this[key].index === 7 ? 0 : this[key].index + 1
    return value
  }

  writeCPU(address: number, value: any) {
    if (address <= 0x1fff) {
      this.workingMemory[address] = value
    } else if (address <= 0x2007) {
      this.ppu.write(address - 0x2000, value)
    } else if (address <= 0x3fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (address === 0x4014) {
      const start = value * 0x100
      for (let i = 0; i < 0x100; i++) {
        this.ppu.spriteRam[i] = this.workingMemory[i + start]
      }
    } else if (address === 0x4016) {
      this.writePadMemory('pad1', value)
    } else if (address === 0x4017) {
      this.writePadMemory('pad2', value)
    } else if (address <= 0x5fff) {
      this.logger.error(address, 'extra ram')
    } else if (address <= 0x7fff) {
      this.logger.error(address, 'backup ram')
    } else if (0x8000 <= address) {
      throw new Error(`${address} shouldn't be written address!`)
    } else {
      throw new Error(`need to implement ${address.toString(16)}`)
    }
  }

  readCPU(address: number): number {
    if (address <= 0x1fff) {
      return this.workingMemory[address]
    } else if (address <= 0x2007) {
      return this.ppu.read(address - 0x2000)
    } else if (address <= 0x3fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (address === 0x4016) {
      return this.readPadMemory('pad1')
    } else if (address === 0x4017) {
      return this.readPadMemory('pad2')
    } else if (address <= 0x5fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (address <= 0x7fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (0x8000 <= address) {
      return this.programMemory[address - 0x8000]
    }
    throw new Error(`need to implement ${address.toString(16)}`)
  }
}
