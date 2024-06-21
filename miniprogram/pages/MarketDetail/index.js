const AV = require("../../libs/av-core-min.js");
Page({
  // 保存商品的 _id 和详细信息
  data: {
    _id: '',
    item: null,
    dateStr: '',
    timeStr: '',
    creditPercent: 0,
    from: '',
    to: '',
    maxCredit: getApp().globalData.maxCredit,
    list: getApp().globalData.collectionMarketList,
  },

  onLoad(options) {
    // 保存上一页传来的 _id 字段，用于查询商品
    if (options.id !== undefined) {
      this.setData({
        _id: options.id
      })
    }
  },
  
  getDate(dateStr){
    const milliseconds = Date.parse(dateStr)
    const date = new Date()
    date.setTime(milliseconds)
    return date
  },

  // 根据 _id 值查询并显示商品
  async onShow() {
    if (this.data._id.length > 0) {
      // 根据 _id 拿到商品
      const query = new AV.Query(this.data.list);
      query.equalTo("id", this.data._id);
      query.find().then((data) => {
        // 将商品保存到本地，更新显示
        let dataAtr = data[0].attributes
        this.setData({
          item: dataAtr,
          dateStr: this.getDate(dataAtr.date).toDateString(),
          timeStr: this.getDate(dataAtr.date).toTimeString(),
          creditPercent: (dataAtr.credit / getApp().globalData.maxCredit) * 100,
        })

        //确定商品关系并保存到本地
        if(this.data.item._openid === getApp().globalData._openidA){
          this.setData({
            from: getApp().globalData.userA,
            to: getApp().globalData.userB,
          })
        }else if(this.data.item._openid === getApp().globalData._openidB){
          this.setData({
            from: getApp().globalData.userB,
            to: getApp().globalData.userA,
          })
        }
      });
    }
  },
})