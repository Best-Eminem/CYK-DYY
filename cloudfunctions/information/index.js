// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  try {
    console.log("Sending message with event data:", event);

    let openid = cloud.getWXContext().OPENID;  // 获取用户的openid
    console.log(openid);
    if (openid === 'o0VYL7U0sUPomHW88vXGLAYeFHc4') {//_openidA放到单引号里
        // openid = '这里改成B的openid';//_openidB放到单引号
        openid = 'o0VYL7U0sUPomHW88vXGLAYeFHc4';//_openidB放到单引号
    } else {
        openid = 'o0VYL7U0sUPomHW88vXGLAYeFHc4';//_openidA放到单引号里
    }



    let taskName = '叮咚～任务更新提醒'
    let creditReward = ''
    let taskDetail = ''
    // 获取发布任务最后一条信息进行推送
    await cloud.callFunction({ name: 'getList', data: { list: 'MissionList' } }).then(res => {
        console.log(res)
        const { data } = res.result
        const task = data.filter(task => task._openid == openid)
        if (task.length) {
            taskName = task[task.length - 1].title
            creditReward = task[task.length - 1].credit
            taskDetail = task[task.length - 1].desc
        }
    })

    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid, // 发送通知给谁的openid(把上面挑好就行，这块不用动)
      data: {
        thing1: {
          value: taskName
        },
        thing2: {
          value: creditReward
        },
        thing3: {
          value: taskDetail
        }
      },
      
      templateId: event.templateId, // 模板ID
      miniprogramState: 'developer',
      page: 'pages/MainPage/index' // 这个是发送完服务通知用户点击消息后跳转的页面
    })
    console.log("Sending message with event data:", event);

    console.log("Message sent successfully:", result);
    return event.startdate
  } catch (err) {
    console.log("Error while sending message:", err);
    return err
  }
}
