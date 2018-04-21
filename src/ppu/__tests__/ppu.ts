import { PPU } from '../ppu'

describe('PPU', () => {
  let ppu: PPU
  beforeEach(() => {
		ppu = new PPU(new Uint8Array(0x1000))
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