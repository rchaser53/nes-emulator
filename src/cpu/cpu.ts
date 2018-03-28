import { HelloOpecodesMap, Order } from './opecode'
import { Handler }  from '../handler'

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
  PC: 0x0000                  // Program Count    16bit
}

const TwoPCUseAddress = [
  'Indirect,Absolute',    // need to implement
  'Absolute,Y',           // need to implement
  'Absolute,X',
  'Absolute'
]

export class CPU {
  register: Register
  handler: Handler

  constructor(handler: Handler) {
    this.register = DefualtRegister
    this.handler = handler
  }

  run(): number {
    const opecode = this.handler.readCPU(this.register.PC)
    const order = this.fetch(opecode)
    console.log(this.register.PC, order, opecode, 1)
    this.executeOpeCode(order)
    return order.cycle
  }

  fetch(opecode: number): Order {
    this.register.PC++
    const opeObject = HelloOpecodesMap[opecode.toString(16)];
    if (opeObject == null) {
      throw new Error(`${opecode} is not correct code or not implementation.`)
    }
    
    return opeObject
  }

  executeDataByAddress(address: string): number {
    const PC = this.register.PC
    this.changeProgramCount(address)
    switch (address) {
      case 'Immediate':
        return this.handler.readCPU(PC)
      case 'Indirect,Y':
        return this.getIndirectIndex(PC, 'Y')
      case 'Absolute':
        return this.getAbsolute(PC)
      case 'Absolute,Y':
        return this.handler.readCPU(this.getAbsoluteIndex(PC, 'Y'))
      case 'ZeroPage':
        return this.handler.readCPU(PC)
      case 'Relative':
        return this.handler.readCPU(PC) + PC + 1
      default:
        throw new Error(`${address} has not implemeneted yet`)
    }
  }

  getIndirectIndex(PC: number, registerKey: string): number {
    const base = this.handler.readCPU(PC)
    const lowerAddress = 0x0000 | this.handler.readCPU(base)
    const upperAddress = this.handler.readCPU((base + 1) & 0xff) << 8
    return (upperAddress | this.handler.readCPU(lowerAddress)) + this.register[registerKey]
  }

  getAbsolute(PC: number): number {
    const lowerAddress = 0x0000 | this.handler.readCPU(PC)
    const upperAddress = this.handler.readCPU(PC + 1) << 8
    return upperAddress | lowerAddress
  }

  getAbsoluteIndex(PC: number, registerKey: string): number {
    return this.getAbsolute(PC) + this.register[registerKey]
  }

  executeOpeCode(order: Order) {
    switch (order.opecode) {
      case 'SEI':
        this.register.P.I = false
        break;

      case 'SEC':
        this.register.P.C = true
        break;

      case 'LDA':
        this.register.A = this.executeDataByAddress(order.address)
        break;

      case 'LDX':
        this.register.X = this.executeDataByAddress(order.address)
        break;

      case 'LDY':
        this.register.Y = this.executeDataByAddress(order.address)
        break;

      case 'TXS':
        this.register.S = this.register.X + 0x0100;
        break;

      case 'TYA':
        this.register.A = this.register.Y
        break;

      case 'STA':
        this.handler.writeCPU(this.executeDataByAddress(order.address), this.register.A)
        break;

      case 'STX':
        this.handler.writeCPU(this.executeDataByAddress(order.address), this.register.X)
        break;

      case 'BNE':
        if (this.register.P.Z === false) {
          this.register.PC = this.executeDataByAddress(order.address)
        }
        break;

      case 'BPL':
        if (this.register.P.N === false) {
          this.register.PC = this.executeDataByAddress(order.address)
        }
        break;

      case 'BCS':
        if (this.register.P.C === true) {
          this.register.PC = this.executeDataByAddress(order.address)
        }
        break;

      case 'BEQ':
        if (this.register.P.Z === true) {
          this.register.PC = this.executeDataByAddress(order.address)
        }
        break;

      case 'BCC':
        if (this.register.P.C === false) {
          this.register.PC = this.executeDataByAddress(order.address)
        }
        break;

      case 'ADC':
        if (this.isCarry(this.register.A, this.handler.readCPU(this.executeDataByAddress(order.address))) === true) {
          this.register.P.C = true
        }
        this.register.A = this.register.A + this.handler.readCPU(this.executeDataByAddress(order.address))
        break;

      case 'DEC':
        const targetMemory = this.executeDataByAddress(order.address)
        this.handler.writeCPU(targetMemory, this.handler.readCPU(targetMemory)  -1)
        break;

      case 'DEY':
        this.register.Y -= 1
        break;

      case 'INC':
        this.handler.writeCPU(this.executeDataByAddress(order.address), 1)
        break;

      case 'RTS':
        this.register.PC = this.returnCaller()
        break;

      case 'EOR':
        this.register.A = this.register.A ^ this.handler.readCPU(this.executeDataByAddress(order.address))
        break;

      case 'JMP':
        this.register.PC = this.handler.readCPU(this.executeDataByAddress(order.address))
        break;

      case 'JSR':
        this.register.PC = this.goToSubroutine(order.address)
        break;

      case 'CMP':
        this.register.P.C = 0 <= (this.register.A - this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'TAY':
        this.register.Y = this.register.A
        break;

      case 'CLC':
        this.register.P.C = false
        break;
      
      default:
        throw new Error(`${JSON.stringify(order)} is not implemented!`)
    }
  }

  changeProgramCount(address: string) {
    this.register.PC += TwoPCUseAddress.includes(address) ? 2 : 1
  }

  // 'JSR'
  goToSubroutine(address: string): number {
    const jumpedAddress = this.executeDataByAddress(address)
    this.pushStack()
    return jumpedAddress
  }

  pushStack() {
    const address = this.register.PC
    this.handler.writeCPU(0x100 | this.register.S, (address >> 8) & 0xff)
    this.handler.writeCPU(0x100 | this.register.S - 1, (address - 1) & 0xff)
    this.register.S -= 2
  }

  // 'RTS'
  returnCaller(): number {
    return this.popStack()
  }

  popStack(): number {
    const lowwer = this.handler.readCPU(0x100 | this.handler.readCPU(this.register.S))
    const upper = this.handler.readCPU(0x100 | this.handler.readCPU(this.register.S - 1)) << 8
    this.register.S -= 2;
    return lowwer + upper + 1
  }

  isCarry(registerNum: number, romNumber: number): boolean {
    const sum = registerNum + romNumber
    return ((sum >> 16) & 0x1) === 1
  }

  reset() {
      // 初期化のための6クロックの後に動作を開始します。
      // todo

      this.register.P.I = true
      
      const lowwer = this.handler.readCPU(0xfffc) & 0xff
      const upper = (this.handler.readCPU(0xfffd) & 0xff) << 8
      this.register.PC = upper | lowwer
  }
}

