const hoge = 0b00


for (let i=1;i<17;i++) {
  console.log(~~(i / 8), i)
}

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