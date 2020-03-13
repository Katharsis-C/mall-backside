const router = require("koa-router")()
const Goods = require("../models/goods")
const User = require("../models/user")

router.prefix("/comment")

router.get("/", async (ctx, next) => {
    let { id } = ctx.query, resList = []
    await User.findOne({_id: id}).then(doc => {
        if(doc) {
            for(let item of doc.comment) {
                resList.push(item)
            }
        }
    })
    await Goods.findOne({_id: id}).then(doc => {
        if(doc) {
            for(let item of doc.comment) {
                resList.push(item)
            }
        }
    })
    await next().then(() => {
        ctx.response.body ={ 
            code: "200",
            data: resList
        }
    })
})

router.post("/", async (ctx, next) => {
    let { userID, itemID, comment } = ctx.request.body
    if (!userID || !itemID || !comment) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "参数出错"
            }
        })
    }
    let [userName, itemName] = [null, null]
    await User.findOne({ _id: userID }).then(doc => {
        // console.log(doc)
        userName = doc.nickname
    })
    await Goods.findOne({ _id: itemID }).then(doc => {
        // console.log(doc)
        itemName = doc.itemName
    })
    // console.log(userName, itemName, comment)
    let commentInUser = {
        itemName: itemName,
        content: comment
    }
    let commentInItem = {
        userName: userName,
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
