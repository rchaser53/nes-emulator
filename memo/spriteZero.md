

- If background or sprite rendering is disabled in PPUMASK   ($2001)
- At x=0 to x=7 if the left-side clipping window is enabled  (if bit 2 or bit 1 of PPUMASK is 0).
- At x=255, for an obscure reason related to the pixel pipeline.
- At any pixel where the background or sprite pixel is transparent (2-bit color index from the CHR pattern is %00).
- If sprite 0 hit has already occurred this frame.
  Bit 6 of PPUSTATUS ($2002) is cleared to 0 at dot 1 of the pre-render line.
  This means only the first sprite 0 hit in a frame can be detected.




- Sprite priority   ... Sprite 0 can still hit the background from behind.
- The pixel colors  ... Only the CHR pattern bits are relevant, not the actual rendered colors,
                        and any CHR color index except %00 is considered opaque.
                        * CHR is an another word for pattern tables, after the traditional name character generator for a tiled background plane.
- The palette       ... The contents of the palette are irrelevant to sprite 0 hits.
                        For example:  a black ($0F) sprite pixel can hit a black ($0F) background
                                      as long as neither is the transparent color index %00.
- The PAL PPU blanking on the left and right edges at x=0, x=1, and x=254 (see Overscan).

