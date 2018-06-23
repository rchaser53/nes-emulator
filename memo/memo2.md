8x8       bullets, puffs of smoke, or puzzle pieces

Using 8x16 pixel sprites can sometimes save CPU time. 


Primary OAM        (holds 64 sprites for the frame)
Secondary OAM      (holds 8 sprites for the current scanline)

8 pairs of 8-bit shift registers
                  These contain the bitmap data for up to 8 sprites,
                  to be rendered on the current scanline. Unused sprites are loaded with an all-transparent bitmap.

8 latches         These contain the attribute bytes for up to 8 sprites.
8 counters        These contain the X positions for up to 8 sprites.


Every cycle, a bit is fetched from the 4 background shift registers in order to create a pixel on screen.
Exactly which bit is fetched depends on the fine X scroll, set by $2005 (this is how fine X scrolling is possible).
Afterwards, the shift registers are shifted once, to the data for the next pixel.

Every 8 cycles/shifts, new data is loaded into these registers.



Sprite zero hits act as if the image starts at cycle 2
(which is the same cycle that the shifters shift for the first time),
so the sprite zero flag will be raised at this point at the earliest.
Actual pixel output is delayed further due to internal render pipelining, and the first pixel is output during cycle 4.


The VBlank flag of the PPU is set at tick 1 (the second tick) of scanline 241,
where the VBlank NMI also occurs.
The PPU makes no memory accesses during these scanlines, so PPU memory can be freely accessed by the program.