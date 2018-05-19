// Initial Register Values
// Register	                          At Power	              After Reset
// PPUCTRL ($2000)	                    0000 0000	              0000 0000
// PPUMASK ($2001)	                    0000 0000	              0000 0000
// PPUSTATUS ($2002)	                  +0+x xxxx	              U??x xxxx
// OAMADDR ($2003)	                    $00	                    unchanged1
// $2005 / $2006 latch	                cleared	                cleared
// PPUSCROLL ($2005)	                  $0000	                  $0000
// PPUADDR ($2006)	                    $0000	                  unchanged
// PPUDATA ($2007) read buffer	        $00	                    $00
// odd frame	                          no	                    no
// OAM	                                pattern	                pattern
// NT RAM (external, in Control Deck)	  mostly $FF	            unchanged
// CHR RAM (external, in Game Pak)	    unspecified pattern	    unchanged

// export interface ControlRegister {
//   nameTableLowwer: boolean // 10(true, false): $2800, 11(true, true): $2C00
//   nameTableUpper: boolean // 00(false, false): $2000, 01(false, true): $2400
//   ppuAddressIncrementMode: boolean // false: +1, true: +32
//   isSpriteBase: boolean // false: $0000  true: $1000
//   isBgBase: boolean // false: $0000  true: $1000
//   isLargesprite: boolean // false: 8x8  true: 8x16
//   masterslabe: true // 常時true
//   isEnableNmi: boolean // false: 無効  true: 有効
// }

// export interface MaskRegister {
//   isDisplayMono: boolean // ディスプレイタイプ　0:カラー、1:モノクロ
//   backgroundMask: boolean // 背景マスク、画面左8ピクセルを描画しない。0:描画しない、1:描画
//   spriteMask: boolean // スプライトマスク、画面左8ピクセルを描画しない。0:描画しない、1:描画
//   isBackgroundEnable: boolean // 背景有効　0:無効、1:有効
//   isSpriteEnable: boolean // スプライト有効　0:無効、1:有効
//   bgColorFlag2: boolean // 背景色
//   bgColorFlag1: boolean // 000:黒, 001:緑
//   bgColorFlag0: boolean // 010:青, 100:赤
// }