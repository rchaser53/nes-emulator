/*
*             MODE          SYNTAX      OPCODE LEN CLK
*/
"78",     //  Implied       SEI           $78   1   2
"a2",     //  Immediate     LDX #$44      $A2   2   2
"9a",     //  Implied       TXS           $9A   1   2
"a9",     //  Immediate     LDA #$44      $A9   2   2
"85",     //  Zero Page     STA $44       $85   2   3
"20",     //  Absolute      JSR $5597     $20   3   6
"98",     //  Implied       TYA           $98   1   2
"a4",     //  Zero Page     LDY $44       $A4   2   3
"d0",     //  Relative      BNE $44       $D0   2   2 +1or2
"c6",     //  Zero Page     DEC $44       $C6   2   5
"a0",     //  Immediate     LDY #$44      $A0   2   2
"91",     //  Indirect,Y    STA ($44),Y   $91   2   5 +1
"60",     //  Implied       RTS           $60   1   6
"49",     //  Immediate     EOR #$44      $49   2   2
"38",     //  Implied       SEC           $38   1   2
"65",     //  Zero Page     ADC $44       $65   2   3
"b0",     //  Relative      BCS $44       $B0   2   2 +1or2
"b9",     //  Absolute,Y    LDA $4400,Y   $B9   3   4 +1
"88",     //  Implied       DEY           $88   1   2
"10",     //  Relative      BPL $44       $10   2   2 +1or2
"4c",     //  Absolute      JMP $5597     $4C   3   3
"f0",     //  Relative      BEQ $44       $F0   2   2 +1or2
"b1",     //  Indirect,Y    LDA ($44),Y   $B1   2   5 +1
"c9",     //  Immediate     CMP #$44      $C9   2   2
"8d",     //  Absolute      STA $4400     $8D   3   4
"e6",     //  Zero Page     INC $44       $E6   2   5
"a8",     //  Implied       TAY           $A8   1   2
"a6",     //  Zero Page     LDX $44       $A6   2   3
"18",     //  Implied       CLC           $18   1   2
"90",     //  Relative      BCC $44       $90   2   2 +1or2
"71",     //  Indirect,Y    ADC ($44),Y   $71   2   5 +1
"86",     //  Zero Page     STX $44       $86   2   3
"69"      //  Immediate     ADC #$44      $69   2   2
