import { Nes } from './nes'

// fetch('./static/hello.nes')
fetch('./static/giko009.nes')
  .then((res) => res.arrayBuffer())
  .then((fileBuffer) => {
    const nes = new Nes(fileBuffer)
    requestAnimationFrame(nes.run.bind(nes))
  })
  .catch((err) => {
    throw new Error(err)
  })
