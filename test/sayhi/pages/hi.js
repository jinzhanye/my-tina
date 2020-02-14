const { Page } = require('../libraries/tina/index')
// const { Page } = require('../libraries/tina')
const { fetchUser } = require('../api')

// import { Page } from '../../../src/index'
// import { fetchUser } from '../api'

const askMixin = {
  methods: {
    ask () {
      console.log('How was your day?')
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
  beforeLoad() {
    console.log(this)
    console.log('i am beforeLoad...')
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
        content: this.data.name,
        showCancel: false,
      })
    },
  }
})
