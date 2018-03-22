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
})