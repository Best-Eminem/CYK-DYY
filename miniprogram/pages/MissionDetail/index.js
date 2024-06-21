const AV = require("../../libs/av-core-min.js");
Page({
  // 保存任务的 _id 和详细信息
  data: {
    _id: '',
    mission: null,
    dateStr: '',
    timeStr: '',
    creditPercent: 0,
    from: '',
    to: '',
    maxCredit: getApp().globalData.maxCredit,
    list: getApp().globalData.collectionMissionList,
  },

  onLoad(options) {
    // 保存上一页传来的 _id 字段，用于查询任务
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

  // 根据 _id 值查询并显示任务
  async onShow() {
    if (this.data._id.length > 0) {
      // 根据 _id 拿到任务
      const query = new AV.Query("MissionList");
      query.equalTo("id", this.data._id);
      query.find().then((data) => {
        // 将任务保存到本地，更新显示
        let dataAtr = data[0].attributes
        this.setData({
          mission: dataAtr,
          dateStr: this.getDate(dataAtr.date).toDateString(),
          timeStr: this.getDate(dataAtr.date).toTimeString(),
          creditPercent: (dataAtr.credit / getApp().globalData.maxCredit) * 100,
        })

        //确定任务关系并保存到本地
        if(this.data.mission._openid === getApp().globalData._openidA){
          this.setData({
            from: getApp().globalData.userA,
            to: getApp().globalData.userB,
          })
        }else if(this.data.mission._openid === getApp().globalData._openidB){
          this.setData({
            from: getApp().globalData.userB,
            to: getApp().globalData.userA,
          })
        }
      });
    }
  },
})