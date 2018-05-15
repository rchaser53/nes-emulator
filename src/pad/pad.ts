import { Handler } from '../handler';

export class Pad {
  handler: Handler
  constructor(handler: Handler) {
    this.handler = handler;
    this.addPadDown();
    this.addPadUp();
  }

  addPadDown() {
    document.addEventListener('keydown', (event) => {
      let value = [0, 0, 0, 0, 0, 0, 0, 0];
      switch (event.keyCode) {
        case 90:      // A button(z)
        value[0] = 1;
          break;
        case 88:      // B button(x)
        value[1] = 1;
          break;
        case 67:      // select(c)
        value[2] = 1;
          break;
        case 86:      // start(v)
        value[3] = 1;
          break;
        case 38:      // up
        value[4] = 1;
          break;
        case 40:      // down
        value[5] = 1;
          break;
        case 37:      // left
        value[6] = 1;
          break;
        case 39:      // right
        value[7] = 1;
          break;
      }
      this.handler.writeCPU(0x4016, value)
    });
  }

  addPadUp() {
    document.addEventListener('keyup', (event) => {
      let value = [0, 0, 0, 0, 0, 0, 0, 0];
      switch (event.keyCode) {
        case 90:      // A button(z)
        value[0] = 0;
          break;
        case 88:      // B button(x)
        value[1] = 0;
          break;
        case 67:      // select(c)
        value[2] = 0;
          break;
        case 86:      // start(v)
        value[3] = 0;
          break;
        case 38:      // up
        value[4] = 0;
          break;
        case 40:      // down
        value[5] = 0;
          break;
        case 37:      // left
        value[6] = 0;
          break;
        case 39:      // right
        value[7] = 0;
          break;
      }
      this.handler.writeCPU(0x4016, value)
    });
  }
}

// 1	A
// 2	B
// 3	SELECT
// 4	START
// 5	上
// 6	下
// 7	左
// 8	右