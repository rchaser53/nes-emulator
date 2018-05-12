import { CPU } from '../cpu'
import { PPU } from '../../ppu/ppu'
import { Handler } from '../../handler'

// this is no a test just tutorial
describe('Hexadecimal', () => {
  test('~~ is like floor', async () => {
    expect(0x01 << ~~(7 / 8)).toEqual(0x01)
    expect(0x01 << ~~(8 / 8)).toEqual(0x02)
    expect(0x01 << ~~(15 / 8)).toEqual(0x02)
  })

  test('0xXX << X is like multiplication', async () => {
    expect(0x80 << 0).toEqual(0x80 * 1)
    expect(0x80 << 1).toEqual(0x80 * 2)
  })

  test('0xXX >> X is like division', async () => {
    expect(0x80 >> 0).toEqual(0x80 / 1)
    expect(0x80 >> 1).toEqual(0x80 / 2)
  })

  test('0xXX << 4 => 0xXX0', async () => {
    expect(0x14 << 4).toEqual(0x140)
    expect(0x14 << 8).toEqual(0x1400)
  })

  test('(0x1XXXX >> 16) & 0x1 === 1', async () => {
    expect((0x10000 >> 16) & 0x1).toEqual(1)
    expect((0x9999 >> 16) & 0x01).toEqual(0)
  })
})

describe('CPU', () => {
  let handler, cpu: CPU
  beforeEach(() => {
    const programMemory = Array.apply(null, Array(3000)).map((_, index) => index % 256)
    const workingMemory = Array.apply(null, Array(3000)).map((_, index) => index % 256)
    handler = new Handler(new PPU(new Uint8Array(0x1000)), programMemory)
    handler.workingMemory = workingMemory
    cpu = new CPU(handler)
  })

  test('getAbsolute', async () => {
    expect(cpu.getAbsolute(0x8011)).toEqual(0x1211)
  })

  test('getAbsoluteIndex', async () => {
    cpu.register.X = 0x1234
    expect(cpu.getAbsoluteIndex(0x8011, 'X')).toEqual(0x1211 + 0x1234)
  })

  test('getIndirectIndex', async () => {
    cpu.register.Y = 0x1234
    expect(cpu.getIndirectIndex(0x0010, 'Y')).toEqual(0x1110 + 0x1234)
  })

  test('stack', async () => {
    // shoud add order and fix test
    cpu.register.S = 0x0010
    cpu.register.PC = 0x8023

    cpu.goToSubroutine('Immediate')
    expect(cpu.register.PC).toEqual(0x8024)
    expect(cpu.register.S).toEqual(0x000e)

    cpu.register.PC = cpu.returnCaller()
    expect(cpu.register.PC).toEqual(0x8024)
    expect(cpu.register.S).toEqual(0x0010)
  })

  test('convertRegisterToDecimal', async () => {
    // const StatusRegisterMap = [
    //   { key: 'N' }, { key: 'V' }, { key: 'R' }, { key: 'B' },
    //   { key: 'D' }, { key: 'I' }, { key: 'Z' }, { key: 'C' }
    // ];

    expect(cpu.convertRegisterToDecimal()).toEqual(0b00101100)

    cpu.register.P.Z = true
    expect(cpu.convertRegisterToDecimal()).toEqual(0b01101100)
  })
})
