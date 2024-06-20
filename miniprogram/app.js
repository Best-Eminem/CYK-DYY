const AV = require("./libs/av-core-min.js");
const adapters = require("./libs/leancloud-adapters-weapp.js");
AV.setAdapters(adapters);
AV.init({
  appId: '9nwdMQHCa1NxSlc4JUgVD9D1-gzGzoHsz',
  appKey: 'DX6lrJ7we6lAJiBX8ZupOefP',
  serverURL: 'https://ozewwcws.lc-cn-n1-shared.com',
});
App({
  async onLaunch() {
    this.initcloud()
    this.globalData = {
      //记录使用者的openid
      _openidA: 'o0VYL7U0sUPomHW88vXGLAYeFHc4',
      _openidB: 'o0VYL7X4QKnDnMCR4K0qFMQHgY8Q',
      currentId:'',

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
    this.login()
  },
  async login(){
    wx.login({
      success (res) {
        if (res.code) {
          // 发起网络请求
          wx.request({
            url:'https://api.weixin.qq.com/sns/jscode2session',
            data: {
              appid: 'wxc066f727e34fff81',
              secret: '33dac1ba6152cbc9a7a04fabad96408f',
              js_code: res.code,
              grant_type: 'authorization_code'
            },
            success: res => {
              if (res.data.openid) {
                console.log('成功获取openid:', res.data.openid); // 成功获取到openid
                getApp().globalData.currentId =  res.data.openid
              } else {
                console.error('获取openid失败:', res.data.errmsg); // 没有获取到openid，返回错误信息
              }
            },
            fail: err => {
              console.error('请求失败:', err.errMsg); // 请求失败，返回错误信息
            }
          })
        } else {
            console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  flag: false,
  /**
   * 初始化云开发环境
   */
  async initcloud() {
    const normalinfo = require('./envList.js').envList || [] // 读取 envlist 文件
    if (normalinfo.length != 0 && normalinfo[0].envId != null) { // 如果文件中 envlist 存在
      wx.cloud.init({ // 初始化云开发环境
        traceUser: true,
        env: normalinfo[0].envId
      })
      // 装载云函数操作对象返回方法
      this.cloud = () => {
        return wx.cloud // 直接返回 wx.cloud
      }
    } else { // 如果文件中 envlist 不存在，提示要配置环境
      this.cloud = () => {
        wx.showModal({
          content: '无云开发环境', 
          showCancel: false
        })
        throw new Error('无云开发环境')
      }
    }
  },

  // 获取云数据库实例
  async database() {
    return (await this.cloud()).database()
  },
})