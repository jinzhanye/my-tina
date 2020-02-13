const { Page } = require('../libraries/tina/index')
const { fetchUser } = require('../api')

// import { Page } from '../../../src/index'
// import { fetchUser } from '../api'

Page.define({
  data: {
    name: 'Tina',
    surname: 'S',
  },
  compute({ name, surname }) {
    return {
      fullname: `${name} ${surname}`
    }
  },
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
        content: this.data.fullname,
        showCancel: false,
      })
    },
  }
})
