import { Nes } from './nes'

// fetch('./static/hello.nes')
fetch('./static/giko008.nes')
  .then((res) => res.arrayBuffer())
  .then((fileBuffer) => {
    const nes = new Nes(fileBuffer)
    nes.run()
  })
  .catch((err) => {
    throw new Error(err)
  })
