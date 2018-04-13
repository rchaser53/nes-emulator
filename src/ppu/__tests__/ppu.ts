import { PPU } from '../ppu'
import {
  convertDecimalToBoolArray,
  createTwoBitTupple
} from '../util'

describe('PPU', () => {
  let ppu: PPU
  beforeEach(() => {
		ppu = new PPU()
  })

	describe('convertDecimalToBoolArray', () => {
    test('convert boolean array correctly', async () => {
      const input = 0b10101011
      const expected = [
        true, true, false, true,
        false, true, false, true
      ]
      expect(convertDecimalToBoolArray(input)).toEqual(expected)
    })

    test('convert short number to bool array', async () => {
      const input = 0b11
      const expected = [
        true, true, false, false,
        false, false, false, false
      ]
      expect(convertDecimalToBoolArray(input)).toEqual(expected)
    })
  })

  describe('createTwoBitTupple', () => {
    test('create boolean tupple', async () => {
      const inputA = [true, false, false, true]
      const inputB = [true, true, true, false]
      const expected = [
        [true, true],  [false, true],
        [false, true], [true, false]
      ]
      expect(createTwoBitTupple(inputA, inputB)).toEqual(expected)
    })
  })

  describe('getNameSpace', () => {
    test('false, false is 0x2000', async () => {
      ppu.register.PPUCTRL.nameTableUpper = false
      ppu.register.PPUCTRL.nameTableLowwer = false
      const expected = 0x2000
      expect(ppu.getNameSpace()).toEqual(expected)
    })

    test('false, true is 0x2400', async () => {
      ppu.register.PPUCTRL.nameTableUpper = false
      ppu.register.PPUCTRL.nameTableLowwer = true
      const expected = 0x2400
      expect(ppu.getNameSpace()).toEqual(expected)
    })

    test('true, false is 0x2800', async () => {
      ppu.register.PPUCTRL.nameTableUpper = true
      ppu.register.PPUCTRL.nameTableLowwer = false
      const expected = 0x2800
      expect(ppu.getNameSpace()).toEqual(expected)
    })

    test('true, true is 0x2C00', async () => {
      ppu.register.PPUCTRL.nameTableUpper = true
      ppu.register.PPUCTRL.nameTableLowwer = true
      const expected = 0x2C00
      expect(ppu.getNameSpace()).toEqual(expected)
    })
  })
})