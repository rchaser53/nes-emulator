import { CPU } from '../cpu'

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
    expect(0x9999 >> 16 & 0x01).toEqual(0)
  })
})

describe('CPU', () => {
  let memory, cpu: CPU;
  beforeEach(() => {
    memory = Array.apply(null, Array(3000)).map((_, index) => (index % 256))
    cpu = new CPU()
  })

	test('getAbsolute', async () => {
    expect(cpu.getAbsolute(memory, 11)).toEqual(0xd0c)
  })

	test('getIndirectIndex', async () => {
    cpu.register.Y = 0x1234
    expect(cpu.getIndirectIndex(memory, 11, 'Y')).toEqual(0xd0c + 0x1234)
	})
})
