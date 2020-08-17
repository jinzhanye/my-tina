import { Component } from '../../libraries/tina/index'

Component.define({
  properties: {
    initCount: {
      type: Number,
      value: 0,
    },
  },
  data: {
    name: 'like',
    count: 0,
  },
  compute({ count, initCount }) {
    return {
      totalCount: count + initCount,
    }
  },
  methods: {
    click() {
      this.setData({
        count: this.data.count + 1
      })
    }
  }
});
