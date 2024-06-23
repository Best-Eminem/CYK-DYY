const AV = require("../../libs/av-core-min.js");
Page({
    data: {
        search: "",

        allItems: [],
        unusedItems: [],
        usedItems: [],
    
        _openidA : getApp().globalData._openidA,
        _openidB : getApp().globalData._openidB,
    
        slideButtons: [
            {extClass: 'useBtn', text: '使用', src: "Images/icon_use.svg"},
            {extClass: 'starBtn', text: '星标', src: "Images/icon_star.svg"},
            {extClass: 'removeBtn', text: '删除', src: 'Images/icon_del.svg'}
        ],
    },
    
    //页面加载时运行
    async onShow(){
        const openid = getApp().globalData.currentId;
        const query = new AV.Query(getApp().globalData.collectionStorageList);
        query.equalTo("openid", openid);
        query.find().then((itemList) => {
          this.setData({allItems: itemList})
          this.filterItem() 
        })
    },
  
    //转到物品详情
    async toDetailPage(element, isUpper) {
      const itemIndex = element.currentTarget.dataset.index
      const item = isUpper ? this.data.unusedItems[itemIndex] : this.data.usedItems[itemIndex]
      wx.navigateTo({url: '../ItemDetail/index?id=' + item._id})
    },
    //转到物品详情[上]
    async toDetailPageUpper(element) {
      this.toDetailPage(element, true)
    },  
    //转到物品详情[下]
    async toDetailPageLower(element) {
      this.toDetailPage(element, false)
    },
  
    //设置搜索
    onSearch(element){
      this.setData({
        search: element.detail.value
      })
  
      this.filterItem()
    },
  
    //将物品划分为：完成，未完成
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
        unusedItems: itemList.filter(item => item.available === true),
        usedItems: itemList.filter(item => item.available === false),
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
  
      //根据序号获得物品
      const itemIndex = element.currentTarget.dataset.index
      const item = isUpper === true ? this.data.unusedItems[itemIndex] : this.data.usedItems[itemIndex]
      const openid = getApp().globalData.currentId;
      //处理完成点击事件
      if (index === 0) {
          if(isUpper) {
              this.useItem(element)
          }else{
              wx.showToast({
                  title: '物品已被使用',
                  icon: 'error',
                  duration: 2000
              })
          }
          
      }else if(item.openid === openid){
          //处理星标按钮点击事件
          if (index === 1) {
              this.editCloudData(getApp().globalData.collectionStorageList, item._id, "star", !item.star);
              //更新本地数据
              item.star = !item.star
          }
          //处理删除按钮点击事件
          else if (index === 2) {
              this.deleteCloudData(getApp().globalData.collectionStorageList, item._id);
              //更新本地数据
              if(isUpper) this.data.unusedItems.splice(itemIndex, 1) 
              else  this.data.usedItems.splice(itemIndex, 1) 
              //如果删除完所有事项，刷新数据，让页面显示无事项图片
              if (this.data.unusedItems.length === 0 && this.data.usedItems.length === 0) {
                  this.setData({
                  allItems: [],
                  unusedItems: [],
                  usedItems: []
                  })
              }
          }

          //触发显示更新
          this.setData({usedItems: this.data.usedItems, unusedItems: this.data.unusedItems})

      //如果编辑的不是自己的物品，显示提醒
      }else{
          wx.showToast({
          title: '只能编辑自己的物品',
          icon: 'error',
          duration: 2000
          })
      }

    },
  
    //使用物品
    async useItem(element) {
        //根据序号获得物品
        const itemIndex = element.currentTarget.dataset.index
        const item = this.data.unusedItems[itemIndex]
        const openid = getApp().globalData.currentId;
        //使用物品
        this.editCloudData(getApp().globalData.collectionStorageList, item._id, "available", false);
        item.available = false
        this.filterItem()
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