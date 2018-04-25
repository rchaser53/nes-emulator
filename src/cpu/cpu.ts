import { Logger } from '../debug/logger'
import { OpecodesMap, Order } from './opecode'
import { Handler }  from '../handler'

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
  A: number,
  X: number,
  Y: number,
  S: number
  P: StatusRegister,
  PC: number
}

const DefaultStatusRegister: StatusRegister = {
  N: false,         // negative 演算結果のbit7が1の時にセット
  V: false,         // overflow P演算結果がオーバーフローを起こした時にセット
  R: true,          // NOTHING
  B: false,         // breakMode set when BRK happen, clear IRQ happen
  D: false,         // decimal mode not implements
  I: false,         // interupt? irq 0: enable irq, 1: ban irq
  Z: false,         // zero flag
  C: false,         // carry flag
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

const StatusRegisterMap = [
  { key: 'N' }, { key: 'V' }, { key: 'R' }, { key: 'B' },
  { key: 'D' }, { key: 'I' }, { key: 'Z' }, { key: 'C' }
];

export class CPU {
  register: Register
  handler: Handler
  logger: Logger

  constructor(handler: Handler, logger?: Logger) {
    this.register = DefualtRegister
    this.handler = handler
    this.logger = logger || new Logger(false)
  }

  run(): number {
    const opecode = this.handler.readCPU(this.register.PC)
    const order = this.fetch(opecode)

    this.logger.log(this.register.PC, order, opecode, 1)

    this.executeOpeCode(order)
    return order.cycle
  }

  fetch(opecode: number): Order {
    this.register.PC++
    const opeObject = OpecodesMap[opecode.toString(16)];
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
      case 'Relative':
        return this.getRelative(PC)
      default:
        throw new Error(`${address} has not implemeneted yet`)
    }
  }

	getRelative(PC: number): number {
    const base = this.handler.readCPU(PC)
		return (base < 0x80)
							? base + PC + 1
							: base + PC + 1 - 256;
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

  convertRegisterToDecimal(): number {
    const statusRegister = this.register.P
    return StatusRegisterMap.reduce((sum, { key }, index) => {
      sum += statusRegister[key] === true ? Math.pow(2, index) : 0
      return sum
    }, 0)
  }

  executeOpeCode(order: Order) {
    switch (order.opecode) {
      case 'BRK':
        this.interruput();
        break;

      case 'SEI':
        this.register.P.I = false
        break;

      case 'SEC':
        this.register.P.C = true
        break;

      case 'LDA':
				this.insertRegister('A', this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'LDX':
				this.insertRegister('X', this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'LDY':
				this.insertRegister('Y', this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'TXS':
				this.insertRegister('S', this.register.X + 0x0100)
        break;

			case 'TYA':
				this.insertRegister('A', this.register.Y)
				break;

      case 'STA':
        this.handler.writeCPU(this.executeDataByAddress(order.address), this.register.A)
        break;

      case 'STX':
        this.handler.writeCPU(this.executeDataByAddress(order.address), this.register.X)
        break;

			case 'BNE':
				this.branchPC(this.register.P.Z, false, order.address)
        break;

			case 'BPL':
				this.branchPC(this.register.P.N, false, order.address)
        break;

			case 'BCS':
				this.branchPC(this.register.P.C, true, order.address)
        break;

			case 'BEQ':
				this.branchPC(this.register.P.Z, true, order.address)
        break;

			case 'BCC':
				this.branchPC(this.register.P.C, false, order.address)
        break;

      case 'ADC':
        this.addRegister('A', this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'SBC':
        this.substractRegister('A', this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'DEC':
        this.addMemoryData(order.address, -1)
        break;

			case 'DEY':
				this.decreaseRegister('Y', 1)
        break;

      case 'INC':
        this.addMemoryData(order.address, 1)
        break;

      case 'RTS':
        this.register.PC = this.returnCaller()
        break;

      case 'EOR':
        this.insertRegister('A', this.register.A ^ this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

			case 'JMP':
				this.register.PC = this.executeDataByAddress(order.address)
        break;

      case 'JSR':
        this.register.PC = this.goToSubroutine(order.address)
        break;

      case 'CMP':
        this.register.P.C = this.setCompare('A', this.handler.readCPU(this.executeDataByAddress(order.address)))
        break;

      case 'TAY':
        this.insertRegister('Y', this.register.A)
        break;

      case 'CLC':
        this.register.P.C = false
        break;

      case 'SED':
        // this order is no mean
        break;

      default:
        throw new Error(`${JSON.stringify(order)} is not implemented!`)
    }
  }

  interruput() {
    // 割り込みが確認された時、Iフラグがセットされていれば割り込みは無視します。
    if (this.register.P.I === false) {
      // Iフラグがクリアされていれば、割り込み動作を開始します。
      // BRKでは、Bフラグをセットし、PCに1を加算します。
      this.register.P.B = true
      this.register.PC++

    // 次にPCの上位バイト、下位バイト、ステータスレジスタを順にスタックへ格納します。
      const address = this.register.PC
      this.handler.writeCPU(0x100 | this.register.S, (address >> 8) & 0xff) // 上位バイト
      this.handler.writeCPU(0x100 | this.register.S - 1, address & 0xff)    // 下位バイト
      this.handler.writeCPU(0x100 | this.register.S - 2, this.convertRegisterToDecimal())    // ステータスレジスタ
      this.register.S -= 3

      // 次にIフラグをセットし、最後にPCの下位バイトを$FFFEから、上位バイトを$FFFFからフェッチします。
      this.register.P.I = true;
      const upper = this.handler.readCPU(0xFFFF);
      const lowwer = this.handler.readCPU(0xFFFE);
      this.register.PC = upper << 8 | lowwer;
    }
  }

  setCompare(key: string, value: number): boolean {
    const ret = this.register['A'] - value
    this.register.P.Z = (ret === 0)
    return 0 <= ret
  }

  addMemoryData(address: string, value: number) {
    const targetMemory = this.executeDataByAddress(address)
    const ret = this.handler.readCPU(targetMemory) + value
    this.handler.writeCPU(targetMemory, ret)

    this.register.P.Z === (0 === ret)
  }

  createADCData(address: string): number {
    const flagValue = (this.register.P.C === true)
                        ? 1
                        : 0
    return this.register.A + this.handler.readCPU(this.executeDataByAddress(address)) + flagValue
  }

	branchPC(register: boolean, condition: boolean, address: string) {
		const nextPC = this.executeDataByAddress(address);
		if (register === condition) {
			this.register.PC = nextPC
		}
	}

  insertRegister(registerKey: string, value: number) {
    this.register[registerKey] = value
    if (0 < this.register[registerKey]) {
      this.register.P.N = false
    }

    this.register.P.Z === (0 === this.register[registerKey])
  }

  addRegister(registerKey: string, value: number) {
    let flagValue = 0;
    if (this.isCarry(this.register[registerKey], value) === true) {
      this.register.P.C = true
      flagValue = 1
    }
    this.register[registerKey] = (this.register[registerKey] + value + flagValue) & 0xFF

    this.changeNZFlag(registerKey);
  }

  substractRegister(registerKey: string, value: number) {
    let flagValue = 1;
    if (this.isCarry(this.register[registerKey], value) === false) {
      this.register.P.C = false
      flagValue = 0
    }
    this.register[registerKey] = (this.register[registerKey] + value - flagValue) & 0xFF
    this.changeNZFlag(registerKey);
  }

  changeNZFlag(registerKey: string) {
    if (0 <= this.register[registerKey]) {
      this.register.P.N = false
    }

    this.register.P.Z === (0 === this.register[registerKey])
  }

  decreaseRegister(registerKey: string, value: number) {
    this.register[registerKey] -= value
    if (this.register[registerKey] < 0) {
      this.register.P.N = true
      this.register[registerKey] += 0x100
    }
    this.register.P.Z === (0 === this.register[registerKey])
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
    const lowwer = this.handler.readCPU(0x100 | this.register.S + 1)
    const upper = this.handler.readCPU(0x100 | this.register.S + 2) << 8
    this.register.S += 2;
    return lowwer + upper + 1
  }

  isCarry(registerNum: number, romNumber: number): boolean {
    const sum = registerNum + romNumber
    return ((sum >> 8) & 0x1) === 1
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

