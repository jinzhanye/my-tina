export const fetchUser = function (cb) {
  return wx.request({
    url: 'https://uinames.com/api/',
    success({ data }) {
      cb(data)
    }
  })
}
