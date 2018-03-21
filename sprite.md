Byte 0
Y position of top of sprite

  Sprite data is delayed by one scanline;
  you must subtract 1 from the sprite's Y coordinate before writing it here.
  Hide a sprite by writing any values in $EF-$FF here.
  Sprites are never displayed on the first line of the picture,
  and it is impossible to place a sprite partially off the top of the screen.

Byte 1
  Tile index number

  For 8x8 sprites, this is the tile number of this sprite within the pattern table selected in bit 3 of PPUCTRL ($2000).
  For 8x16 sprites, the PPU ignores the pattern table selection and selects a pattern table from bit 0 of this number.


  1スプライトにつき16Byte、1ピクセルにつき2bit