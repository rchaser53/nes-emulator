import { Logger } from '../debug/logger'
import { OpecodesMap, Order } from './opecode'
import { Handler } from '../handler'
import { Interrupt } from '../nes'

export interface StatusRegister {
  N: boolean
  V: boolean
  R: true
  B: boolean
  D: false
  I: boolean
  Z: boolean
  C: boolean
}

export interface Register {
  A: number
  X: number
  Y: number
  S: number
  P: StatusRegister
  PC: number
}

const DefaultStatusRegister: StatusRegister = {
  N: false, // negative 演算結果のbit7が1の時にセット
  V: false, // overflow P演算結果がオーバーフローを起こした時にセット
  R: true, // NOTHING
  B: true, // breakMode set when BRK happen, clear IRQ happen
  D: false, // decimal mode not implements
  I: true, // interupt? irq 0: enable irq, 1: ban irq
  Z: false, // zero flag
  C: false // carry flag
}

export const DefualtRegister: Register = {
  A: 0x00, // Accumulator      8bit
  X: 0x00, // IndexesX         8bit
  Y: 0x00, // IndexesY         8bit
  S: 0x1ff, // Stack Pointer    8bit
  P: DefaultStatusRegister, // Status Register  8bit
  PC: 0x0000 // Program Count    16bit
}

const TwoPCUseAddress = [
  'Indirect,Absolute', // need to implement
  'Absolute,Y', // need to implement
  'Absolute,X',
  'Absolute'
]

const StatusRegisterMap = [
  { key: 'N' },
  { key: 'V' },
  { key: 'R' },
  { key: 'B' },
  { key: 'D' },
  { key: 'I' },
  { key: 'Z' },
  { key: 'C' }
]

const NmiBinary = 0b10000000

export class CPU {
  interrupt: Interrupt
  register: Register
  handler: Handler
  logger: Logger
  cycle: number = 0

  constructor(handler: Handler, interrupt: Interrupt, logger?: Logger) {
    this.register = DefualtRegister
    this.handler = handler
    this.interrupt = interrupt
    this.logger = logger || new Logger(false)
  }

  run(): number {
    if (this.isIrq) {
      this.irqInterrupt()
    }

    if (this.isNmi) {
      this.nmiInterrupt()
    }

    const opecode = this.handler.readCPU(this.register.PC)
    const order = this.fetch(opecode)

    this.executeOpeCode(order)
    this.cycle += order.cycle
    return order.cycle
  }

  get isNmi(): boolean {
    return (this.handler.ppu.register.PPUCTRL & NmiBinary) === NmiBinary
              && this.interrupt.isNmi
  }

  get isIrq(): boolean {
    return this.register.P.I === false
  }

  nmiInterrupt() {
    this.register.P.B = false

    const address = this.register.PC
    this.handler.writeCPU(this.register.S--, (address >> 8) & 0xff)
    this.handler.writeCPU(this.register.S--, address & 0xff)
    this.handler.writeCPU(this.register.S--, this.convertRegisterToDecimal())

    this.register.P.I = true
    const upper = this.handler.readCPU(0xfffb)
    const lowwer = this.handler.readCPU(0xfffa)
    this.register.PC = (upper << 8) | lowwer

    this.interrupt.isNmi = false;
  }

  brkInterrupt() {
    if (this.register.P.I === false) {
      this.register.P.B = true
      this.register.PC++

      const address = this.register.PC
      this.handler.writeCPU(this.register.S--, (address >> 8) & 0xff)
      this.handler.writeCPU(this.register.S--, address & 0xff)
      this.handler.writeCPU(this.register.S--, this.convertRegisterToDecimal())

      this.register.P.I = true
      const upper = this.handler.readCPU(0xffff)
      const lowwer = this.handler.readCPU(0xfffe)
      this.register.PC = (upper << 8) | lowwer
    }
  }

  irqInterrupt() {
    if (this.register.P.I === false) {
      this.register.P.B = false
      this.register.PC++

      const address = this.register.PC
      this.handler.writeCPU(this.register.S--, (address >> 8) & 0xff)
      this.handler.writeCPU(this.register.S--, address & 0xff)
      this.handler.writeCPU(this.register.S--, this.convertRegisterToDecimal())

      this.register.P.I = true
      const upper = this.handler.readCPU(0xffff)
      const lowwer = this.handler.readCPU(0xfffe)
      this.register.PC = (upper << 8) | lowwer
    }
  }

  returnForInterrupt() {
    this.convertDecimalToRegister(this.handler.readCPU(++this.register.S))
    const lowwer = this.handler.readCPU(++this.register.S) & 0xff
    const upper = this.handler.readCPU(++this.register.S) & 0xff
    this.register.PC = (upper << 8) | lowwer
  }

  fetch(opecode: number): Order {
    this.register.PC++
    const opeObject = OpecodesMap[opecode.toString(16)]
    if (opeObject == null) {
      throw new Error(`${opecode.toString(16)} is not correct code or not implementation.`)
    }

    return opeObject
  }

  executeDataByAddress(address: string): number {
    const PC = this.register.PC
    this.changeProgramCount(address)
    switch (address) {
      case 'Immediate':
        return PC
      case 'Indirect,X':
        return this.getIndirectIndex(PC, 'X')
      case 'Indirect,Y':
        return this.getIndirectIndex(PC, 'Y')
      case 'Absolute':
        return this.getAbsolute(PC)
      case 'Absolute,X':
        return this.getAbsoluteIndex(PC, 'X')
      case 'Absolute,Y':
        return this.getAbsoluteIndex(PC, 'Y')
      case 'ZeroPage':
        return this.handler.readCPU(PC)
      case 'ZeroPage,X':
        return this.getZeroIndex(PC, 'X')
      case 'ZeroPage,Y':
        return this.getZeroIndex(PC, 'Y')
      case 'Relative':
        return this.getRelative(PC)
      default:
        throw new Error(`${address} has not implemeneted yet`)
    }
  }

  getRelative(PC: number): number {
    const base = this.handler.readCPU(PC)
    return base < 0x80 ? base + PC + 1 : base + PC + 1 - 256
  }

  getIndirectIndex(PC: number, registerKey: string): number {
    const base = this.handler.readCPU(PC)
    const lowerAddress = 0x0000 | this.handler.readCPU(base)
    const upperAddress = this.handler.readCPU((base + 1) & 0xff) << 8
    return (upperAddress | lowerAddress) + this.register[registerKey]
  }

  getAbsolute(PC: number): number {
    const lowerAddress = 0x0000 | this.handler.readCPU(PC)
    const upperAddress = this.handler.readCPU(PC + 1) << 8
    return upperAddress | lowerAddress
  }

  getAbsoluteIndex(PC: number, registerKey: string): number {
    return this.getAbsolute(PC) + this.register[registerKey]
  }

  getZeroIndex(PC: number, registerKey: string): number {
    return this.handler.readCPU(PC) + this.register[registerKey]
  }

  convertRegisterToDecimal(): number {
    const statusRegister = this.register.P
    return StatusRegisterMap.reduce((sum, { key }, index) => {
      sum += statusRegister[key] === true ? Math.pow(2, index) : 0
      return sum
    }, 0)
  }

  convertDecimalToRegister(input: number) {
    return StatusRegisterMap.forEach(({ key }, index) => {
      const base = Math.pow(2, index)
      this.register.P[key] = (base & input) === base ? true : 0
    })
  }

  executeOpeCode(order: Order) {
    switch (order.opecode) {
      case 'BRK':
        this.brkInterrupt()
        break

      case 'SEI':
        this.register.P.I = true
        break

      case 'SEC':
        this.register.P.C = true
        break

      case 'TXS':
        this.insertRegister('S', this.register.X + 0x0100)
        break

      case 'TYA':
        this.insertRegister('A', this.register.Y)
        break

      case 'TAY':
        this.insertRegister('Y', this.register.A)
        break

      case 'BNE':
        this.branchPC(this.register.P.Z, false, order.address)
        break

      case 'BPL':
        this.branchPC(this.register.P.N, false, order.address)
        break

      case 'BCS':
        this.branchPC(this.register.P.C, true, order.address)
        break

      case 'BEQ':
        this.branchPC(this.register.P.Z, true, order.address)
        break

      case 'BCC':
        this.branchPC(this.register.P.C, false, order.address)
        break

      case 'DEC':
        this.addMemoryData(order.address, -1)
        break

      case 'DEX':
        this.decreaseRegister('X', 1)
        break

      case 'DEY':
        this.decreaseRegister('Y', 1)
        break

      case 'INC':
        this.addMemoryData(order.address, 1)
        break

      case 'INX':
        this.increaseRegister('X', 1)
        break

      case 'INY':
        this.increaseRegister('Y', 1)
        break

      case 'RTS':
        this.register.PC = this.popStack()
        break

      case 'CLC':
        this.register.P.C = false
        break

      case 'CLD':
        this.register.P.D = false
        break

      case 'SED':
        // this order is no mean
        break

      case 'JSR':
        this.register.PC = this.goToSubroutine(order.address)
        break

      case 'RTI':
        this.returnForInterrupt()
        break

      default:
        this.executeOpeCodeWithAddress(order)
    }
  }

  executeOpeCodeWithAddress(order) {
    const address = this.executeDataByAddress(order.address)
    switch (order.opecode) {
      case 'STA':
        this.handler.writeCPU(address, this.register.A)
        break

      case 'STX':
        this.handler.writeCPU(address, this.register.X)
        break

      case 'ADC':
        this.addRegister('A', this.handler.readCPU(address))
        break

      case 'AND':
        this.logicalOperation('A', this.handler.readCPU(address) & this.register.A)
        break

      case 'ORA':
        this.logicalOperation('A', this.handler.readCPU(address) | this.register.A)
        break

      case 'EOR':
        this.logicalOperation('A', this.register.A ^ this.handler.readCPU(address))
        break

      case 'SBC':
        this.substractRegister('A', this.handler.readCPU(address))
        break

      case 'LDA':
        this.insertRegister('A', this.handler.readCPU(address))
        break

      case 'LDX':
        this.insertRegister('X', this.handler.readCPU(address))
        break

      case 'LDY':
        this.insertRegister('Y', this.handler.readCPU(address))
        break

      case 'JMP':
        this.register.PC = address
        break

      case 'CMP':
        this.register.P.C = this.setCompare('A', this.handler.readCPU(address))
        break

      case 'CPX':
        this.register.P.C = this.setCompare('X', this.handler.readCPU(address))
        break

      case 'CPY':
        this.register.P.C = this.setCompare('Y', this.handler.readCPU(address))
        break

      default:
        throw new Error(`${JSON.stringify(order)} is not implemented!`)
    }
  }

  setCompare(key: string, value: number): boolean {
    const ret = this.register[key] - value
    this.register.P.Z = ret === 0
    this.register.P.N = !!(ret & 0x80)
    return 0 <= ret
  }

  addMemoryData(address: string, value: number) {
    const targetMemory = this.executeDataByAddress(address)
    const ret = this.handler.readCPU(targetMemory) + value
    this.handler.writeCPU(targetMemory, ret)

    this.register.P.Z = (0 === ret)
    this.register.P.N = !!(ret & 0x80)
  }

  createADCData(address: string): number {
    const flagValue = this.register.P.C === true ? 1 : 0
    return this.register.A + this.handler.readCPU(this.executeDataByAddress(address)) + flagValue
  }

  branchPC(register: boolean, condition: boolean, address: string) {
    const nextPC = this.executeDataByAddress(address)
    if (register === condition) {
      this.register.PC = nextPC
    }
  }

  logicalOperation(key: string, value: number) {
    this.register.P.N = !!(value & 0x80)
    this.register.P.Z = value === 0
    this.register[key] = value
  }

  insertRegister(registerKey: string, value: number) {
    const beforeRegisterValue = this.register[registerKey]
    this.register[registerKey] = value
    this.changeNZFlag(registerKey, beforeRegisterValue)
  }

  addRegister(registerKey: string, value: number) {
    const beforeRegisterValue = this.register[registerKey]
    let flagValue = 0
    if (this.isCarry(this.register[registerKey], value) === true) {
      this.register.P.C = true
      flagValue = 1
    }
    this.register[registerKey] = (this.register[registerKey] + value + flagValue) & 0xff

    this.changeNVZFlag(registerKey, beforeRegisterValue)
  }

  substractRegister(registerKey: string, value: number) {
    const beforeRegisterValue = this.register[registerKey]
    let flagValue = 1
    if (this.isCarry(this.register[registerKey], value) === false) {
      this.register.P.C = false
      flagValue = 0
    }
    this.register[registerKey] = (this.register[registerKey] + value - flagValue) & 0xff
    this.changeNVZFlag(registerKey, beforeRegisterValue)
  }

  changeNZFlag(registerKey: string, beforeRegisterValue: number) {
    this.register.P.N = !!(this.register[registerKey] & 0x80)
    this.register.P.Z = (0 === this.register[registerKey])
  }

  changeNVZFlag(registerKey: string, beforeRegisterValue: number) {
    this.register.P.V = this.isOverFlagTrue(registerKey, beforeRegisterValue)
    this.register.P.N = !!(this.register[registerKey] & 0x80)
    this.register.P.Z = (0 === this.register[registerKey])
  }

  changeNVFlag(registerKey: string, beforeRegisterValue: number) {
    this.register.P.N = !!(this.register[registerKey] & 0x80)
    this.register.P.Z = (0 === this.register[registerKey])
  }

  isOverFlagTrue(registerKey: string, beforeRegisterValue: number): boolean {
    if (beforeRegisterValue <= 0x7f && 0x80 <= this.register[registerKey]) return true
    if (this.register[registerKey] <= 0x7f && 0x80 <= beforeRegisterValue) return true
    return false
  }

  increaseRegister(registerKey: string, value: number) {
    const beforeRegisterValue = this.register[registerKey]
    this.register[registerKey] = (this.register[registerKey] + value) & 0xff
    this.changeNZFlag(registerKey, beforeRegisterValue)
  }

  decreaseRegister(registerKey: string, value: number) {
    const beforeRegisterValue = this.register[registerKey]
    this.register[registerKey] = (this.register[registerKey] - value) & 0xff
    this.changeNZFlag(registerKey, beforeRegisterValue)
  }

  changeProgramCount(address: string) {
    this.register.PC += TwoPCUseAddress.includes(address) ? 2 : 1
  }

  goToSubroutine(address: string): number {
    const jumpedAddress = this.executeDataByAddress(address)
    this.pushStack()
    return jumpedAddress
  }

  pushStack() {
    const address = this.register.PC
    this.handler.writeCPU(this.register.S--, (address >> 8) & 0xff)
    this.handler.writeCPU(this.register.S--, (address - 1) & 0xff)
  }

  popStack(): number {
    const lowwer = this.handler.readCPU(++this.register.S)
    const upper = this.handler.readCPU(++this.register.S) << 8
    return lowwer + upper + 1
  }

  isCarry(registerNum: number, romNumber: number): boolean {
    const sum = registerNum + romNumber
    return ((sum >> 8) & 0x1) === 1
  }

  reset() {
    this.register.P.I = true

    const lowwer = this.handler.readCPU(0xfffc) & 0xff
    const upper = (this.handler.readCPU(0xfffd) & 0xff) << 8
    this.register.PC = upper | lowwer || 0x8000
  }
}
