import { PPU } from './ppu/ppu'

export class Handler {
  ppu: PPU
  workingMemory: Uint8Array
  programMemory: Uint8Array

  constructor(ppu: PPU, programRam: Uint8Array) {
    this.ppu = ppu
    this.workingMemory = new Uint8Array(0x2000)
    this.programMemory = programRam
  }

  writeCPU(address: number, value: number) {
    if (address <= 0x1fff) {
      this.workingMemory[address] = value
    } else if (address <= 0x2007) {
      this.ppu.write(address - 0x2000, value)
    } else if (address <= 0x3fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (address <= 0x5fff) {
      console.error(address, 'extra ram')
    } else if (address <= 0x7fff) {
      console.error(address, 'backup ram')
    } else if (0x8000 <= address) {
      throw new Error(`${address} shouldn't be written address!`)
    }
  }

  readCPU(address: number): number {
    if (address <= 0x1fff) {
      return this.workingMemory[address]
    } else if (address <= 0x2007) {
      return this.ppu.readRegister(address - 0x2000)
    } else if (address <= 0x3fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (address <= 0x5fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (address <= 0x7fff) {
      throw new Error(`${address} is used. need to search!`)
    } else if (0x8000 <= address) {
      return this.programMemory[address - 0x8000]
    }
    throw new Error('why come?')
  }
}