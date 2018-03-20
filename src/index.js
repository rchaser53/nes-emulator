const axios = require('axios')

axios.get('./static/hello.nes')
      .then((ret) => {
        console.log(ret)
      })
      .catch((err) => {
        throw new Error(err)
      })