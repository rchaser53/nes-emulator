import { HelloOpecodesMap, Order } from './opecode'

export interface StatusRegister {  
  C: boolean
  Z: boolean
  I: boolean
  D: false
  B: boolean
  R: true
  O: boolean
  N: boolean
}

export interface Register {
  A: number,
  X: number,
  Y: number,
  S: number
  P: StatusRegister,
  PC: number
}

const DefaultStatusRegister: StatusRegister = {
  C: false,         // carry flag 
  Z: false,         // zero flag
  I: false,         // interupt? irq 0: enable irq, 1: ban irq
  D: false,         // decimal mode not implements
  B: false,         // breakMode set when BRK happen, clear IRQ happen
  R: true,          // NOTHING
  O: false,         // overflow P演算結果がオーバーフローを起こした時にセット
  N: false          // negative 演算結果のbit7が1の時にセット
}

export const DefualtRegister: Register = {
  A: 0x00,                    // Accumulator      8bit
  X: 0x00,                    // IndexesX         8bit
  Y: 0x00,                    // IndexesY         8bit
  S: 0x00,                    // Stack Pointer    8bit
  P: DefaultStatusRegister,   // Status Register  8bit
  PC: 0x00                    // Program Count    16bit
}

export class CPU {
  register: Register
  constructor() {
    this.register = DefualtRegister
  }

  load() {
    // return HelloOpecodesMap[byte]
  }

  run(programRom: Uint8Array) {
    const opecode = programRom[this.register.PC]
    const order = this.fetch(opecode)
    this.register.PC += order.len
    this.executeOpeCode(programRom, order)
  }

  fetch(opecode: number): Order {
    const opeObject = HelloOpecodesMap[opecode.toString(16)];
    if (opeObject == null) {
      throw new Error(`${opecode} is not correct code or not implementation.`)
    }
    
    return opeObject
  }

  executeDataByAddress(programRom: Uint8Array, address: string): number {
    const PC = this.register.PC
    switch (address) {
      case 'Immediate':
        return programRom[PC + 1]
      case 'Indirect,Y':
        return programRom[this.getIndirectIndex(programRom, PC, 'Y')]
      case 'Absolute':
        return programRom[this.getAbsolute(programRom, PC)]
      case 'Absolute,Y':
        return programRom[this.getAbsoluteIndex(programRom, PC, 'Y')]
      case 'ZeroPage':
        return programRom[programRom[PC + 1]]
      case 'Relative':
        return programRom[programRom[PC + 1] + programRom[PC + 2]]
      default:
        throw new Error(`${address} has not implemeneted yet`)
    }
  }

  getIndirectIndex(programRom: Uint8Array, PC: number, registerKey: string): number {
    const lowerAddress = 0x0000 | programRom[PC + 1]
    const upperAddress = programRom[PC + 2] << 8
    return upperAddress | programRom[lowerAddress] + this.register[registerKey]
  }

  getAbsolute(programRom: Uint8Array, PC: number): number {
    const lowerAddress = 0x0000 | programRom[PC + 1]
    const upperAddress = programRom[PC + 2] << 8
    return upperAddress | lowerAddress
  }

  getAbsoluteIndex(programRom: Uint8Array, PC: number, registerKey: string): number {
    return this.getAbsolute(programRom, PC) + this.register[registerKey]
  }

  executeOpeCode(programRom: Uint8Array, order: Order) {
    switch (order.opecode) {
      case 'SEI':
        this.register.P.I = false
        break;

      case 'SEC':
        this.register.P.C = true
        break;

      case 'LDA':
        this.register.A = this.executeDataByAddress(programRom, order.address)
        break;

      case 'LDX':
        this.register.X = this.executeDataByAddress(programRom, order.address)
        break;

      case 'LDY':
        this.register.Y = this.executeDataByAddress(programRom, order.address)
        break;

      case 'TXS':
        this.register.S = this.register.X
        break;

      case 'TYA':
        this.register.A = this.register.Y
        break;

      case 'STA':
        programRom[this.executeDataByAddress(programRom, order.address)] = this.register.A
        break;

      case 'STX':
        programRom[this.executeDataByAddress(programRom, order.address)] = this.register.X
        break;

      case 'BNE':
        if (this.register.P.Z === false) {
          this.register.PC = this.executeDataByAddress(programRom, order.address)
          break;
        }
        break;

      case 'BPL':
        if (this.register.P.N === false) {
          this.register.PC = this.executeDataByAddress(programRom, order.address)
          break;
        }
        break;

      case 'BCS':
        if (this.register.P.C === true) {
          this.register.PC = this.executeDataByAddress(programRom, order.address)
          break;
        }
        break;

      case 'BEQ':
        if (this.register.P.Z === true) {
          this.register.PC = this.executeDataByAddress(programRom, order.address)
          break;
        }
        break;

      case 'BCC':
        if (this.register.P.C === false) {
          this.register.PC = this.executeDataByAddress(programRom, order.address)
          break;
        }
        break;

      case 'ADC':
        if (this.isCarry(this.register.A, programRom[this.executeDataByAddress(programRom, order.address)]) === true) {
          this.register.P.C = true
        }
        this.register.A = this.register.A + programRom[this.executeDataByAddress(programRom, order.address)]
        break;

      case 'DEC':
        programRom[this.executeDataByAddress(programRom, order.address)] -= 1
        break;

      case 'DEY':
        this.register.Y -= 1
        break;

      case 'INC':
        programRom[this.executeDataByAddress(programRom, order.address)] += 1
        break;

      case 'RTS':
        this.returnCaller(programRom)
        break;

      case 'EOR':
        this.register.A = this.register.A ^ programRom[this.executeDataByAddress(programRom, order.address)]
        break;

      case 'JMP':
        this.register.PC = programRom[this.executeDataByAddress(programRom, order.address)]
        break;

      case 'JSR':
        this.goToSubroutine(programRom, order.address)
        break;

      case 'CMP':
        this.register.P.C = 0 <= (this.register.A - programRom[this.executeDataByAddress(programRom, order.address)])
        break;

      case 'TAY':
        this.register.Y = this.register.A
        break;

      case 'CLC':
        this.register.P.C = false
        break;

    }
  }

  goToSubroutine(programRom: Uint8Array, address: string) {
    const jumpedAddress = programRom[this.executeDataByAddress(programRom, address)]
    this.pushStack(programRom)
    this.register.PC = jumpedAddress
  }

  pushStack(programRom: Uint8Array) {
    const address = this.register.PC
    programRom[0x100 | programRom[this.register.S + 1]] = (address >> 8) & 0xff
    programRom[0x100 | programRom[this.register.S + 2]] = address & 0xff
    this.register.S += 2
  }

  returnCaller(programRom: Uint8Array) {
    this.popStack(programRom)
  }

  popStack(programRom: Uint8Array) {
    const lowwer = programRom[0x100 | programRom[this.register.S]]
    const upper = programRom[0x100 | programRom[this.register.S - 1]] << 8
    this.register.PC = lowwer + upper + 1
    this.register.S -= 2;
  }

  isCarry(registerNum: number, romNumber: number): boolean {
    const sum = registerNum + romNumber
    return ((sum >> 16) & 0x1) === 1
  }

  // TODO
  reset() {

  }
}

