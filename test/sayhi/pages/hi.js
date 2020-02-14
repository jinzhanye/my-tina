import { Page } from '../libraries/tina/index'
// const { Page } = require('../libraries/tina')
import { fetchUser } from '../api'


// import { Page } from '../../../src/index'
// import { fetchUser } from '../api'

// 开启 debug 模式，可以查看框架内部日志
// Page.debug =true

const askMixin = {
  methods: {
    ask () {
      wx.showModal({
        title: 'ask!',
        content: 'ask!!!',
        showCancel: false,
      })
    },
  },
}

Page.define({
  mixins: [askMixin],
  data: {
    name: 'Tina',
    surname: 'S',
  },
  compute({ name, surname }) {
    return {
      fullname: `${name} ${surname}`
    }
  },
  beforeLoad() {},
  onLoad() {
    fetchUser()
      .then(({ name, surname }) => this.setData({
        name: 'hello',
        surname: 'world'
      }))
  },
  methods: {
    sayHi() {
      wx.showModal({
        title: 'Hi!',
        content: this.data.name,
        showCancel: false,
      })
    },
  }
})
