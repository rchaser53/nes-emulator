const drawCharcterToCanvas = (canvasIdSelector, nesPath) => {
  const canvas = document.querySelector(canvasIdSelector)
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgb(0, 0, 0)";

  const NES_HEADER_SIZE = 0x0010;
  const PROGRAM_ROM_SIZE = 0x4000;
  const CHARACTOR_ROM_SIZE = 0x2000;
  const DEFAULT_CANVAS_WIDTH = 800;
  const PIXEL_RATIO = 1;

  fetch(nesPath)
    .then((res) => res.arrayBuffer())
    .then((nesBuffer) => {
      const nesData = new Uint8Array(nesBuffer);
      const programROMPages = nesData[4];
      const characterROMPages = nesData[5];

      const spritesPerRow = canvas.width / (8 * PIXEL_RATIO);
      const spritesNum = CHARACTOR_ROM_SIZE * characterROMPages / 16;
      const rowNum = ~~(spritesNum / spritesPerRow) + 1;
      const height = rowNum * 8 * PIXEL_RATIO;

      ctx.fillRect(0, 0, canvas.width, height);

      const charactorROMsart = NES_HEADER_SIZE + programROMPages * PROGRAM_ROM_SIZE;
      const buildSprite = (spriteNum) => {
        const sprite = Array.apply(null, Array(8)).map((_) => [0,0,0,0,0,0,0,0]);
        for (let i = 0; i < 16; i++) {
          for (let j = 0; j < 8; j++) {
            if (nesData[charactorROMsart + spriteNum * 16 + i] & (0x80 >> j )) {
              sprite[i % 8][j] += 0x01 << (i / 8);
            }
          }
        }
        return sprite;
      }
      const renderSprite = (sprite, spriteNum) => {
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            ctx.fillStyle = `rgb(${85 * sprite[i][j]}, ${85 * sprite[i][j]}, ${85 * sprite[i][j]})`;
            const x = (j + (spriteNum % spritesPerRow) * 8) * PIXEL_RATIO;
            const y = (i + ~~(spriteNum / spritesPerRow) * 8) * PIXEL_RATIO;
            ctx.fillRect(x, y, PIXEL_RATIO, PIXEL_RATIO);
          }
        }
      };

      for(let i = 0; i < spritesNum; i++) {
        const sprite =  buildSprite(i);
        renderSprite(sprite, i);
      }
    })
    .catch((err) => {
      throw new Error(err)
    })
}