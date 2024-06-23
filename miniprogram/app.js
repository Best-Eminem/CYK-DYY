const AV = require("./libs/av-core-min.js");
const adapters = require("./libs/leancloud-adapters-weapp.js");
AV.setAdapters(adapters);
AV.init({
  appId: 'r03GWMSlfiir78mI9vT813Jb-gzGzoHsz',
  appKey: '9j0vcA8Y70ggupOFxBxN5iOI',
  serverURL: 'https://ozewwcws.lc-cn-n1-shared.com',
});
App({
  async onLaunch() {
    // this.initcloud()
    this.globalData = {
      //记录使用者的openid
      _openidA: 'o0VYL7U0sUPomHW88vXGLAYeFHc4',
      _openidB: 'o0VYL7X4QKnDnMCR4K0qFMQHgY8Q',
      currentId:'',
      accessToken:"",
      templateId: "D-6tEJ4Bu4Ra_wnRIhn07CwKss9p-BiGBLBshX8MqTI",
      //记录使用者的名字
      userA: 'cyk',
      userB: 'dyy',

      //用于存储待办记录的集合名称
      collectionMissionList: 'MissionList',
      collectionMarketList: 'MarketList',
      collectionStorageList: 'StorageList',
      collectionUserList: 'UserList',

      //最多单次交易积分
      maxCredit: 100,
      //日期
      date:"2023/12/26 00:00:00",
    }
    this.login();
    this.getToken();
  },
  async getToken(){
    AV.Cloud.run("getAccessToken", {}).then(
      function (data) {
        // 处理结果
        console.log("成功获取access_token:",data.access_token)
        getApp().globalData.accessToken = data.access_token
      },
      function (err) {
        // 处理报错
        console.log(err)
      }
    );
  },
  async login(){
    AV.User.loginWithWeapp().then(user => {
      getApp().globalData.currentId =  user.attributes.authData.lc_weapp.openid
      console.log('成功获取openid:', getApp().globalData.currentId); // 成功获取到openid
    }).catch(console.error);
    //         data: {
    //           appid: 'wxc066f727e34fff81',
    //           secret: '33dac1ba6152cbc9a7a04fabad96408f',
    //           js_code: res.code,
    //           grant_type: 'authorization_code'
  },
  flag: false,
  /**
   * 初始化云开发环境
   */
  // async initcloud() {
  //   const normalinfo = require('./envList.js').envList || [] // 读取 envlist 文件
  //   if (normalinfo.length != 0 && normalinfo[0].envId != null) { // 如果文件中 envlist 存在
  //     wx.cloud.init({ // 初始化云开发环境
  //       traceUser: true,
  //       env: normalinfo[0].envId
  //     })
  //     // 装载云函数操作对象返回方法
  //     this.cloud = () => {
  //       return wx.cloud // 直接返回 wx.cloud
  //     }
  //   } else { // 如果文件中 envlist 不存在，提示要配置环境
  //     this.cloud = () => {
  //       wx.showModal({
  //         content: '无云开发环境', 
  //         showCancel: false
  //       })
  //       throw new Error('无云开发环境')
  //     }
  //   }
  // },

  // // 获取云数据库实例
  // async database() {
  //   return (await this.cloud()).database()
  // },
})