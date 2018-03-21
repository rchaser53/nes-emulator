const hoge = 0b00


// for (let i=1;i<17;i++) {
//   console.log(~~(i / 8), i)
// }

// get scrollTileX(): Byte {
  /*
    Name table id and address
    +------------+------------+
    |            |            | 
    |  0(0x2000) |  1(0x2400) | 
    |            |            |
    +------------+------------+ 
    |            |            | 
    |  2(0x2800) |  3(0x2C00) | 
    |            |            |
    +------------+------------+             
  */
//   return ~~((this.scrollX + ((this.nameTableId % 2) * 256)) / 8);
// }
const j = 1;
console.log(
  (0x80 >> j).toString(16),
  0x80.toString(16),
  (0x80 << 0).toString(16),

  // (0x80 >> j)
  0b10000000,
  0x01 << ~~(0 / 8),
  0x01 << ~~(8 / 8),
  0x01 << ~~(15 / 8)
  // (0x80 << 1).toString(16),
  // (0x80 * 2).toString(16)
)

// 0x80 >> j

// 0b10000000

// 「AND」は、二つの数値のビットを比較して「両方１ならば１」を出す演算です。 これは、特定のデータだけを取り出したいときなどに使えます。 
