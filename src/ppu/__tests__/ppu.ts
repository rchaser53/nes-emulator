import { PPU } from '../ppu'

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
      expect(ppu.convertDecimalToBoolArray(input)).toEqual(expected)
    })

    test('convert short number to bool array', async () => {
      const input = 0b11
      const expected = [
        true, true, false, false,
        false, false, false, false
      ]
      expect(ppu.convertDecimalToBoolArray(input)).toEqual(expected)
    })
  })

})