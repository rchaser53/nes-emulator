- Uint8Array タイプは、8 ビット符号なし整数値の配列

- 0-3 NES(文字列)
- 4 programROMPages
- 5 characterROMPages
- !(6 & 0x01) isHorizontalMirror
- (((nes[6] & 0xF0) >> 4) | nes[7] & 0xF0) mapper

- NES_HEADER_SIZE = 0x0010;
const PROGRAM_ROM_SIZE = 0x4000;
const CHARACTER_ROM_SIZE = 0x2000;


JSR (Jump to new location saving return address)
  ADDR -> PC
  サブルーチンへジャンプします。
  まずジャンプ先のアドレスをアドレス指定によって取得した後、 PCを上位バイト、下位バイトの順にスタックへプッシュします。 このときのPCはトラップの項にもあるようにJSRの最後のバイトアドレスです。 最後にジャンプ先へジャンプします。
  flags: none

RTS (Return from Subroutine)
  サブルーチンから復帰します。
  復帰アドレスをスタックから、下位バイト、 上位バイトの順にポップしたのちインクリメントします。
  flags: none


サブルーチン
  アセンブリ内に書かれている関数的なあれ


- 0x3F00～0x3F0F バックグラウンドパレット が colorsのindexを指定
- 0x3F10～0x3F1F スプライトパレット      が colorsのindexを指定