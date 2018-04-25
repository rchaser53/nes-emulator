export interface Order {
  opecode: string,
  data: number,
  address: string,
  len: number,
  cycle: number
}

export const HelloOpecodesMap: { [key: string]: Order} = {
  "0":  { opecode: 'BRK', data: 0x0000, address: 'Implied', len: 1, cycle: 7 },           //  Implied       BRK           $0    1   7
  "38": { opecode: 'SEC', data: 0x0000, address: 'Implied', len: 1, cycle: 2 },           //  Implied       SEC           $38   1   2
  "78": { opecode: 'SEI', data: 0x0000, address: 'Implied', len: 1, cycle: 2  },          //  Implied       SEI           $78   1   2

  "a9": { opecode: 'LDA', data: 0x0044, address: 'Immediate', len: 2, cycle: 2  },        //  Immediate     LDA #$44      $A9   2   2
  "b1": { opecode: 'LDA', data: 0x0044, address: 'Indirect,Y', len: 2, cycle: 5 },        //  Indirect,Y    LDA ($44),Y   $B1   2   5 +1
  "b9": { opecode: 'LDA', data: 0x4400, address: 'Absolute,Y', len: 3, cycle: 4 },        //  Absolute,Y    LDA $4400,Y   $B9   3   4 +1
  "a2": { opecode: 'LDX', data: 0x0044, address: 'Immediate', len: 2, cycle: 2  },        //  Immediate     LDX #$44      $A2   2   2
  "a6": { opecode: 'LDX', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 3 },          //  Zero Page     LDX $44       $A6   2   3
  "a0": { opecode: 'LDY', data: 0x0044, address: 'Immediate', len: 2, cycle: 2  },        //  Immediate     LDY #$44      $A0   2   2
  "a4": { opecode: 'LDY', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 3  },         //  Zero Page     LDY $44       $A4   2   3
  
  "9a": { opecode: 'TXS', data: 0x0000, address: 'Implied', len: 1, cycle: 2  },          //  Implied       TXS           $9A   1   2
  "98": { opecode: 'TYA', data: 0x0000, address: 'Implied', len: 1, cycle: 2  },          //  Implied       TYA           $98   1   2

  "85": { opecode: 'STA', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 3  },         //  Zero Page     STA $44       $85   2   3
  "8d": { opecode: 'STA', data: 0x4400, address: 'Absolute', len: 3, cycle: 4 },          //  Absolute      STA $4400     $8D   3   4
  "91": { opecode: 'STA', data: 0x0044, address: 'Indirect,Y', len: 2, cycle: 5 },        //  Indirect,Y    STA ($44),Y   $91   2   5 +1
  "86": { opecode: 'STX', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 3 },          //  Zero Page     STX $44       $86   2   3

  "10": { opecode: 'BPL', data: 0x0044, address: 'Relative', len: 2, cycle: 2 },          //  Relative      BPL $44       $10   2   2 +1or2
  "90": { opecode: 'BCC', data: 0x0044, address: 'Relative', len: 2, cycle: 2 },          //  Relative      BCC $44       $90   2   2 +1or2
  "b0": { opecode: 'BCS', data: 0x0044, address: 'Relative', len: 2, cycle: 2 },          //  Relative      BCS $44       $B0   2   2 +1or2
  "d0": { opecode: 'BNE', data: 0x0044, address: 'Relative', len: 2, cycle: 2  },         //  Relative      BNE $44       $D0   2   2 +1or2
  "f0": { opecode: 'BEQ', data: 0x0044, address: 'Relative', len: 2, cycle: 2 },          //  Relative      BEQ $44       $F0   2   2 +1or2

  "60": { opecode: 'RTS', data: 0x0000, address: 'Implied', len: 1, cycle: 6 },           //  Implied       RTS           $60   1   6

  "49": { opecode: 'EOR', data: 0x0044, address: 'Immediate', len: 2, cycle: 2 },         //  Immediate     EOR #$44      $49   2   2

  "65": { opecode: 'ADC', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 3 },          //  Zero Page     ADC $44       $65   2   3
  "69": { opecode: 'ADC', data: 0x0044, address: 'Immediate', len: 2, cycle: 2 },         //  Immediate     ADC #$44      $69   2   2
  "71": { opecode: 'ADC', data: 0x0044, address: 'Indirect,Y', len: 2, cycle: 5 },        //  Indirect,Y    ADC ($44),Y   $71   2   5 +1
  "88": { opecode: 'DEY', data: 0x0000, address: 'Implied', len: 1, cycle: 2 },           //  Implied       DEY           $88   1   2
  "c6": { opecode: 'DEC', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 5  },         //  Zero Page     DEC $44       $C6   2   5
  "e6": { opecode: 'INC', data: 0x0044, address: 'ZeroPage', len: 2, cycle: 5 },         //  Zero Page     INC $44       $E6   2   5
  
  "4c": { opecode: 'JMP', data: 0x5597, address: 'Absolute', len: 3, cycle: 3 },          //  Absolute      JMP $5597     $4C   3   3
  "20": { opecode: 'JSR', data: 0x5597, address: 'Absolute', len: 3, cycle: 6  },         //  Absolute      JSR $5597     $20   3   6

  "c9": { opecode: 'CMP', data: 0x0044, address: 'Immediate', len: 2, cycle: 2 },         //  Immediate     CMP #$44      $C9   2   2

  "a8": { opecode: 'TAY', data: 0x0000, address: 'Implied', len: 1, cycle: 2 },           //  Implied       TAY           $A8   1   2
  "18": { opecode: 'CLC', data: 0x0000, address: 'Implied', len: 1, cycle: 2 },           //  Implied       CLC           $18   1   2
  "f8": { opecode: 'SED', data: 0x0000, address: 'Implied', len: 1, cycle: 2 },           //  Implied       SED           $f8   1   2
}

export const HelloOpecodes = [
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
  'SED', // Set Decimal Mode    1 -> D
]