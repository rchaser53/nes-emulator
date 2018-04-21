import { PPU } from '../ppu'
import {
  convertDecimalToBoolArray,
  createTwoBitTupple,
  createSpliteInputs,
  convertBoolArrayToDecimal,
  createColorTileDef,
  convertDecimalToTwoBit,
  reverseArray,
} from '../util'

describe('PPU', () => {
  let ppu: PPU
  beforeEach(() => {
		ppu = new PPU(new Uint8Array(0x1000))
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
    test('create boolean tupple array', async () => {
      const inputA = [true, false, false, true]
      const inputB = [true, true, true, false]
      const expected = [
        [true, true],  [false, true],
        [false, true], [true, false]
      ]
      expect(createTwoBitTupple(inputA, inputB)).toEqual(expected)
    })
  })

  describe('createColorTileDef', () => {
    test('create length 4 decimal array array', async () => {
      const input = [123, 142, 321, 1234,
                     444, 142, 321, 1234,
                     444, 142, 321, 1234]
      const expected = [
        [1, 3, 2, 3, 2, 0, 3, 2, 1, 0, 0, 1, 3, 1, 0, 2],
        [2, 3, 3, 0, 2, 0, 3, 2, 1, 0, 0, 1, 3, 1, 0, 2],
        [2, 3, 3, 0, 2, 0, 3, 2, 1, 0, 0, 1, 3, 1, 0, 2]
      ]
      expect(createColorTileDef(input)).toEqual(expected)
    })
  })

  describe('convertDecimalToTwoBit', () => {
    test('convert decimal to 4 2bit numbers', async () => {
      expect(convertDecimalToTwoBit(118)).toEqual([1, 3, 1, 2])
      expect(convertDecimalToTwoBit(1)).toEqual([0, 0, 0, 1])
      expect(convertDecimalToTwoBit(255)).toEqual([3, 3, 3, 3])
    })
  })

  describe('reverseArray', () => {
    test('reverse array element', async () => {
      expect(reverseArray([1, 2, 3, 4])).toEqual([4, 3, 2, 1])
      expect(reverseArray([])).toEqual([])
      expect(reverseArray([1])).toEqual([1])
      expect(reverseArray([1,2])).toEqual([2, 1])
    })
  })

  describe('createSpliteInput', () => {
    test('create number array array', async () => {
      const input = [60, 60, 126, 126, 255, 255, 255, 231, 56, 56, 108, 108, 198, 254, 198, 0]
      const expected = [
        [0, 0, 1, 2, 2, 2, 0, 0],
        [0, 0, 1, 2, 2, 2, 0, 0],
        [0, 1, 2, 2, 1, 2, 2, 0],
        [0, 1, 2, 2, 1, 2, 2, 0],
        [1, 2, 2, 1, 1, 1, 2, 2],
        [1, 2, 2, 2, 2, 2, 2, 2],
        [1, 2, 2, 1, 1, 1, 2, 2],
        [1, 1, 1, 0, 0, 1, 1, 1]
      ]

      expect(createSpliteInputs(input)).toEqual(expected)
    })
  })

  describe('convertBoolArrayToDecimal', () => {
    test('convert boolArray to decimal', async () => {

      expect(convertBoolArrayToDecimal([false])).toEqual(0)
      expect(convertBoolArrayToDecimal([true])).toEqual(1)
      expect(convertBoolArrayToDecimal([true, false])).toEqual(2)
      expect(convertBoolArrayToDecimal([true, false, true, false])).toEqual(10)
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