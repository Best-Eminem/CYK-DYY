const AV = require("../../libs/av-core-min.js");
Page({
    //增加消息接收与发送功能
    async handleTap() {
        await this.saveMission();
  },
  //发送消息
  sendSubscribeMessage(e) {
      this.information();
  },
  information(){
    try {
      let openid_a = getApp().globalData._openidA;
      let openid_b = getApp().globalData._openidB;
      let taskName = '叮咚～任务更新提醒'
      let creditReward = ''
      let taskDetail = ''
      // 获取发布任务最后一条信息进行推送
      const query = new AV.Query(getApp().globalData.collectionMissionList);
      query.equalTo("available", true);
      query.find().then((taskList) => {
        if (taskList.length > 0) {
          let task = taskList[taskList.length - 1].attributes
          taskName = task.title
          creditReward = task.credit
          taskDetail = task.desc
          var message1 = {
            accessToken:getApp().globalData.accessToken,
            touser:openid_a,
            taskName:taskName,
            creditReward:creditReward,
            taskDetail:taskDetail,
            templateId:getApp().globalData.templateId
          }
          var message2 = {
            accessToken:getApp().globalData.accessToken,
            touser:openid_b,
            taskName:taskName,
            creditReward:creditReward,
            taskDetail:taskDetail,
            templateId:getApp().globalData.templateId
          }
          AV.Cloud.run("sendMessage", message1).then(
            function (data) {
              // 处理结果
              console.log("成功send")
            },
            function (err) {
              // 处理报错
              console.log(err)
            }
          );
          AV.Cloud.run("sendMessage", message2).then(
            function (data) {
              // 处理结果
              console.log("成功send")
            },
            function (err) {
              // 处理报错
              console.log(err)
            }
          );
        }
      });
      wx.showModal({
      title: '发送成功',
      content: '请返回微信主界面查看',
      showCancel: false,
      })
      wx.showToast({
      title: '发送成功，请返回微信主界面查看',
      })
      // this.setData({
      // subscribeMessageResult: JSON.stringify(res.result)
      // })
      return 'send ok'
    } catch (err) {
      wx.showToast({
        icon: 'none',
        title: '调用失败',
        })
        console.error(' subscribeMessage.send 调用失败：', err)
      return err
    }
  },
  //保存正在编辑的任务
  data: {
    title: '',
    desc: '',
    
    credit: 0,
    maxCredit: getApp().globalData.maxCredit,
    presetIndex: 0,
    presets: [{
      name:"无预设",
      title:"",
      desc:"",
    },{
      name:"早睡早起",
      title:"晚上要早睡，明天早起",
      desc:"熬夜对身体很不好，还是要早点睡觉第二天才能有精神！",
    },{
      name:"打扫房间",
      title:"清扫房间，整理整理",
      desc:"有一段时间没有打扫房间了，一屋不扫，何以扫天下？",
    },{
      name:"健康运动",
      title:"做些运动，注意身体",
      desc:"做一些健身运动吧，跳绳，跑步，训练动作什么的。",
    },{
      name:"戒烟戒酒",
      title:"烟酒不解真愁",
      desc:"维持一段时间不喝酒，不抽烟，保持健康生活！",
    },{
      name:"请客吃饭",
      title:"请客吃点好的",
      desc:"好吃的有很多，我可以让你尝到其中之一，好好享受吧！",
    },{
      name:"买小礼物",
      title:"整点小礼物",
      desc:"买点小礼物，像泡泡马特什么的。",
    },{
      name:"洗碗洗碟",
      title:"这碗碟我洗了",
      desc:"有我洗碗洗碟子，有你吃饭无它事。",
    },{
      name:"帮拿东西",
      title:"帮拿一天东西",
      desc:"有了我，你再也不需要移动了。拿外卖，拿零食，开空调，开电视，在所不辞。",
    },{
      name:"制作饭菜",
      title:"这道美食由我完成",
      desc:"做点可口的饭菜，或者专门被指定的美食。我这个大厨，随便下，都好吃。",
    }],
    list: getApp().globalData.collectionMissionList,
  },
  commitSuccess:false,
  //数据输入填写表单
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  onDescInput(e) {
    this.setData({
      desc: e.detail.value
    })
  },
  onCreditInput(e) {
    this.setData({
      credit: e.detail.value
    })
  },
  onPresetChange(e){
    this.setData({
      presetIndex: e.detail.value,
      title: this.data.presets[e.detail.value].title,
      desc: this.data.presets[e.detail.value].desc,
    })
  },

  //保存任务
  async saveMission() {
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '标题未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.title.length > 12) {
      wx.showToast({
        title: '标题过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.desc.length > 100) {
      wx.showToast({
        title: '描述过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.credit <= 0) {
      wx.showToast({
        title: '一定要有积分',
        icon: 'error',
        duration: 2000
      })
      return
    }else{
        // 声明 class
        const Mission = AV.Object.extend(this.data.list);
        // 构建对象
        const mission = new Mission();
        // 为属性赋值
        mission.set("openid",getApp().globalData.currentId);
        mission.set("date", new Date());
        mission.set("credit",this.data.credit);
        mission.set("title", this.data.title);
        mission.set("desc",this.data.desc);
        mission.set("available", true);
        mission.set("star",false);
        // 将对象保存到云端
        mission.save().then(
          (mission) => {
            // 成功保存之后，执行其他逻辑
            console.log(`保存成功。objectId：${mission.id}`);
            this.commitSuccess = true
            this.sendSubscribeMessage();
          },
          (error) => {
            // 异常处理
            console.log(error);
          }
        );
        setTimeout(function () {
          wx.navigateBack()
        }, 1000)
    }
  },

  // 重置所有表单项
  resetMission() {
    this.setData({
      title: '',
      desc: '',
      credit: 0,
      presetIndex: 0,
      list: getApp().globalData.collectionMissionList,
    })
  }
})