/* Main page of the app */
const AV = require("../../libs/av-core-min.js");
Page({
    //允许接收服务通知
    async requestSubscribeMessage() {
        const templateId = getApp().globalData.templateId//填入你自己想要的模板ID，记得复制粘贴全，我自己因为网页没开全，结果浪费半小时
        wx.requestSubscribeMessage({
        //tmplIds: [templateId,templateId2,templateId3],
        tmplIds: [templateId],
        success: (res) => {
            //if (res[templateId] === 'accept'&&res[templateId2] === 'accept'&&res[templateId3] === 'accept') {
            if (res[templateId] === 'accept') {
            this.setData({
                requestSubscribeMessageResult: '成功',
            })
            } else {
            this.setData({
                requestSubscribeMessageResult: `失败（${res[templateId]}）`,
            })
            }
        },
        fail: (err) => {
            this.setData({
            requestSubscribeMessageResult: `失败（${JSON.stringify(err)}）`,
            })
        },
        })
    },
    data: {
        creditA: 0,
        creditB: 0,

        userA: '',
        userB: '',
    },

    async onShow(){
        this.getCreditA()
        this.getCreditB()
        this.setData({
            userA: getApp().globalData.userA,
            userB: getApp().globalData.userB,
        })
        this.getDays()
    },

    getCreditA(){
        const query = new AV.Query(getApp().globalData.collectionUserList);
        query.equalTo("openid", getApp().globalData._openidA);
        query.find().then((data) => {
          this.setData({creditA: data[0].attributes.credit})
        });
    },
    
    getCreditB(){
        const query = new AV.Query(getApp().globalData.collectionUserList);
        query.equalTo("openid", getApp().globalData._openidB);
        query.find().then((data) => {
          this.setData({creditB: data[0].attributes.credit})
        });
    },

    getDays(){
      var beginDate = new Date(getApp().globalData.date); 
      var endDate = new Date();
      var dateDistance = endDate.getTime() - beginDate.getTime();
      this.setData({days:Math.floor(dateDistance/(24*3600*1000)+1)})
    }
})