const AV = require("../../libs/av-core-min.js");
Page({
  data: {
    screenWidth: 1000,
    screenHeight: 1000,

    search: "",
    credit: 0,
    user: "",

    allItems: [], //所有商品
    unboughtItems: [], //上架商品
    boughtItems: [], //下架商品

    _openidA : getApp().globalData._openidA,
    _openidB : getApp().globalData._openidB,

    slideButtons: [
      {extClass: 'buyBtn', text: '购买', src: "Images/icon_buy.svg"},
      {extClass: 'starBtn', text: '星标', src: "Images/icon_star.svg"},
      {extClass: 'removeBtn', text: '删除', src: 'Images/icon_del.svg'}
    ],
  },

  //页面加载时运行
  async onShow(){
    this.getCurrentCredit()
    this.getUser()
    const query = new AV.Query(getApp().globalData.collectionMarketList);
    query.find().then((itemList) => {
      this.setData({allItems: itemList})
      this.filterItem()
      this.getScreenSize()
    });
  },

  async getUser(){
    const openid = getApp().globalData.currentId;
    if(openid === getApp().globalData._openidA){
      this.setData({
          user: getApp().globalData.userA,
      })
    }else if(openid === getApp().globalData._openidB){
      this.setData({
          user: getApp().globalData.userB,
      })
    }
  },

  //获取当前账号积分数额
  async getCurrentCredit(){
    const openid = getApp().globalData.currentId;
    const query = new AV.Query(getApp().globalData.collectionUserList);
    query.equalTo("openid", openid);
    query.find().then((data) => {
      this.setData({
        credit: data[0].attributes.credit
      }) 
    })
  },

  //获取页面大小
  async getScreenSize(){
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          screenWidth: res.windowWidth,
          screenHeight: res.windowHeight
        })
      }
    })
  },

  //转到商品详情
  async toDetailPage(element, isUpper) {
    const itemIndex = element.currentTarget.dataset.index
    const item = isUpper ? this.data.unboughtItems[itemIndex] : this.data.boughtItems[itemIndex]
    wx.navigateTo({url: '../MarketDetail/index?id=' + item._id})
  },
  //转到商品详情[上]
  async toDetailPageUpper(element) {
    this.toDetailPage(element, true)
  },  
  //转到商品详情[下]
  async toDetailPageLower(element) {
    this.toDetailPage(element, false)
  },
  //转到添加商品
  async toAddPage() {
    wx.navigateTo({url: '../MarketAdd/index'})
  },

  //设置搜索
  onSearch(element){
    this.setData({
      search: element.detail.value
    })

    this.filterItem()
  },

  //将商品划分为：完成，未完成
  filterItem(){
    let itemList = []
    if(this.data.search != ""){
      for(let i in this.data.allItems){
        if(this.data.allItems[i].get("title").match(this.data.search) != null){
          itemList.push(this.data.allItems[i].attributes)
        }
      }
      for(let i in itemList){
        if (typeof(itemList[i].date) != "string"){
          let tt = itemList[i].date.toISOString().substring(0,10)
          itemList[i].date = tt
        }
        itemList[i]._id = this.data.allItems[i].id
      }
    }else{
      for(let i in this.data.allItems){
        itemList.push(this.data.allItems[i].attributes)
      }
      for(let i in itemList){
        if (typeof(itemList[i].date) != "string"){
          let tt = itemList[i].date.toISOString().substring(0,10)
          itemList[i].date = tt
        }
        itemList[i]._id = this.data.allItems[i].id
      }
    }

    this.setData({
      unboughtItems: itemList.filter(item => item.available === true),
      boughtItems: itemList.filter(item => item.available === false),
    })
  },

  //响应左划按钮事件[上]
  async slideButtonTapUpper(element) {
    this.slideButtonTap(element, true)
  },

  //响应左划按钮事件[下]
  async slideButtonTapLower(element) {
    this.slideButtonTap(element, false)
  },

  //响应左划按钮事件逻辑
  async slideButtonTap(element, isUpper){
    //得到UI序号
    const {index} = element.detail

    //根据序号获得商品
    const itemIndex = element.currentTarget.dataset.index
    const item = isUpper === true ? this.data.unboughtItems[itemIndex] : this.data.boughtItems[itemIndex]
    const openid = getApp().globalData.currentId;
    //处理完成点击事件
    if (index === 0) {
        if(isUpper) {
            this.buyItem(element)
        }else{
            wx.showToast({
                title: '物品已被购买',
                icon: 'error',
                duration: 2000
            })
        }
        
    }else if(item.openid === openid){
        //处理星标按钮点击事件
        if (index === 1) {
            this.editCloudData(getApp().globalData.collectionMarketList, item._id, "star", !item.star);
            //更新本地数据
            item.star = !item.star
        }
        //处理删除按钮点击事件
        else if (index === 2) {
            this.deleteCloudData(getApp().globalData.collectionMarketList, item._id);
            //更新本地数据
            if(isUpper) this.data.unboughtItems.splice(itemIndex, 1) 
            else  this.data.boughtItems.splice(itemIndex, 1) 
            //如果删除完所有事项，刷新数据，让页面显示无事项图片
            if (this.data.unboughtItems.length === 0 && this.data.boughtItems.length === 0) {
                this.setData({
                allItems: [],
                unboughtItems: [],
                boughtItems: []
                })
            }
        }
        //触发显示更新
        this.setData({boughtItems: this.data.boughtItems, unboughtItems: this.data.unboughtItems})

    //如果编辑的不是自己的商品，显示提醒
    }else{
            wx.showToast({
            title: '只能编辑自己的商品',
            icon: 'error',
            duration: 2000
            })
        }
  },

  //购买商品
  async buyItem(element) {
    //根据序号获得商品
    const itemIndex = element.currentTarget.dataset.index
    const item = this.data.unboughtItems[itemIndex]
    const openid = getApp().globalData.currentId;
    //如果购买自己的物品，显示提醒
    if(item.openid === openid){
      wx.showToast({
        title: '不能购买自己上架的物品',
        icon: 'error',
        duration: 2000
      })
    //如果没有积分，显示提醒
    }else if(this.data.credit < item.credit){
      wx.showToast({
        title: '积分不足...',
        icon: 'error',
        duration: 2000
      })
    }else{
      //购买对方物品，奖金从自己账号扣除，并添加物品到自己的库里
      this.editCloudData(getApp().globalData.collectionMarketList, item._id, "available", false);
      this.incrementCloudData(getApp().globalData.collectionUserList, openid, "credit", -item.credit);
      // 声明 class
      const Storage = AV.Object.extend(getApp().globalData.collectionStorageList);
      // 构建对象
      const storage = new Storage();
      // 为属性赋值
      storage.set("openid",openid);
      storage.set("date", new Date());
      storage.set("credit",item.credit);
      storage.set("title", item.title);
      storage.set("desc",item.desc);
      storage.set("available", true);
      storage.set("star",false);
      // 将对象保存到云端
      storage.save().then(
        (storage) => {
          // 成功保存之后，执行其他逻辑
          console.log(`保存成功。objectId：${storage.id}`);
        },
        (error) => {
          // 异常处理
          console.log(error);
        }
      );
      //显示提示
      wx.showToast({
          title: '购买成功',
          icon: 'success',
          duration: 2000
      })

      //触发显示更新
      this.setData({
        credit: this.data.credit - item.credit
      })

      item.available = false
      this.filterItem()
    }
  },
  editCloudData(tableName, _id, attr, value){
    const todo = AV.Object.createWithoutData(tableName, _id);
    todo.set(attr, value);
    todo.save();
  },
  incrementCloudData(tableName, openid, attr, value){
    //先查询openid对应的id
    let _id = '';
    const query = new AV.Query(tableName);
    query.equalTo("openid", openid);
    query.first().then((data) => {
      _id = data.id
      const todo = AV.Object.createWithoutData(tableName, _id);
      todo.increment(attr, value);
      todo.save();
    });
  },
  deleteCloudData(tableName, _id){
    const todo = AV.Object.createWithoutData(tableName, _id);
    todo.destroy();
  },
})