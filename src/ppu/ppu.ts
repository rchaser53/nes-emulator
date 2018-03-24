// 0x2000 - 0x2007
export interface Register {
  PPUCTRL: number,                  // コントロールレジスタ1	割り込みなどPPUの設定
  PPUMASK: number,                  // コントロールレジスタ2	背景 enableなどのPPU設定
  PPUSTATUS: number,                // ppu status
  OAMADDR: number,                  // スプライトメモリデータ	書き込むスプライト領域のアドレス
  OAMDATA: number,                  // デシマルモード	スプライト領域のデータ
  PPUSCROLL: number,                // 背景スクロールオフセット	背景スクロール値
  PPUADDR: number,                  // PPUメモリアドレス	書き込むPPUメモリ領域のアドレス
  PPUDATA: number,                  // PPUメモリデータ	PPUメモリ領域のデータ
}

export class PPU {
  
}


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