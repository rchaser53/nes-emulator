fetch('./static/hello.nes')
  .then((res) => res.arrayBuffer())
  .then((file) => {
    console.log(file)
  })
  .catch((err) => {
    throw new Error(err)
  })

/**
 * A アキュムレータ
 * M アドレッシングによってフェッチされたメモリデータ
 * flags 命令実行によって設定するフラグ
*/
const HelloOpecodes = [
  'SEI', // Set Interrupt disable
  'SEC', // Set C flag	1 -> C

  'LDA', // Load A from M	  M -> A
  'LDX', // Load X from M	  M -> X
  'LDY', //

  'TXS', // Transfer X to S	  X -> S
  'TYA', // Transfer Y to A	  Y -> A

  'STA', // Store A to M	  A -> M
  'STX', // Store X to M

  'BNE', // Branch on Z clear (result not equal)  Zフラグがクリアされていれば分岐します
  'BPL', // Branch on N clear (result plus)
  'BCS', // Branch on C set
  'BEQ', // Branch on Z set (result equal)
  'BCC', // Branch on C clear

  'ADC', // Add M to A with C	    A + M + C -> A
  'DEC', // Decrement M by one	  M - 1 -> M
  'DEY', // Decrement Y by one    Y - 1 -> Y
  'INC', // Increment M by one	M + 1 -> M

  'RTS', // Return from Subroutine サブルーチンから復帰

  'EOR', // EOR ("Exclusive-OR" M with A)	A eor M -> A

  'JMP', // Jump to new location ADDR -> PC flags: none
  'JSR', // Jump to new location saving return address  ADDR -> PC *

  'CMP', // Compare M and A	    A - M

  'TAY', // Transfer A to Y	    A -> Y
  'CLC', // Clear C flag
]