const router = require("koa-router")()
const Goods = require("../models/goods")
const User = require("../models/user")

router.prefix("/comment")

//获取评论
router.get("/", async (ctx, next) => {
    let { id } = ctx.query,
        resList = []
    await User.findOne({ _id: id }).then(doc => {
        if (doc) {
            for (let item of doc.comment) {
                resList.push(item)
            }
        }
    })
    await Goods.findOne({ _id: id }).then(doc => {
        if (doc) {
            for (let item of doc.comment) {
                resList.push(item)
            }
        }
    })
    await next().then(() => {
        ctx.response.body = {
            code: "200",
            data: resList
        }
    })
})

//添加评论
router.post("/", async (ctx, next) => {
    let { userID, itemID, comment } = ctx.request.body,
        current = `${date.getFullYear()}-${date.getMonth() +
            1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

    if (!userID || !itemID || !comment) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "参数出错"
            }
        })
    }
    let [userName, itemName, itemImg] = [null, null, null]
    await User.findOne({ _id: userID }).then(doc => {
        // console.log(doc)
        userName = doc.nickname
    })
    await Goods.findOne({ _id: itemID }).then(doc => {
        // console.log(doc)
        itemImg = doc.homeImg
        itemName = doc.itemName
    })
    // console.log(userName, itemName, comment)

    //创建用户评论对象
    let commentInUser = {
        itemImg: `http:127.0.0.1:3000${itemImg.replace(/-/g, `\/`)}`,
        type: String,
        itemName: itemName,
        time: current,
        content: comment
    }
    //创建商品评论对象
    let commentInItem = {
        userName: userName,
        time: current,
        content: comment
    }

    // console.log(commentInItem, commentInUser)
    await User.updateOne(
        { _id: userID },
        { $addToSet: { comment: commentInUser } }
    )
    await Goods.updateOne(
        { _id: itemID },
        { $addToSet: { comment: commentInItem } }
    )
    await next().then(() => {
        ctx.response.body = {
            code: "200",
            msg: "评论成功"
        }
    })
})

module.exports = router
