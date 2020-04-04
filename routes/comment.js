const router = require('koa-router')()
const Goods = require('../models/goods')
const User = require('../models/user')
const Comment = require('../models/comment')

const findAndReturn = require('../utils/findAndReturn')
const convertImgPath = require('../utils/convertImgPath')

router.prefix('/comment')

//获取评论
router.get('/', async (ctx, next) => {
    // let { id } = ctx.query,
    //     resList = []
    // await User.findOne({ _id: id }).then(doc => {
    //     if (doc) {
    //         for (let item of doc.comment) {
    //             resList.push(item)
    //         }
    //     }
    // })
    // await Goods.findOne({ _id: id }).then(doc => {
    //     if (doc) {
    //         for (let item of doc.comment) {
    //             resList.push(item)
    //         }
    //     }
    // })
    // await next().then(() => {
    //     ctx.response.body = {
    //         code: "200",
    //         data: resList,
    //         total: resList.length
    // }
    // })

    //1-用户  2-商品
    let { commentType, id } = ctx.query,
        resList = [],
        res = null
    switch (commentType) {
        case 1:
            res = await Comment({ userId: id }).then((doc) => doc)
            break
        case 2:
            res = await Comment({ itemId: id }).then((doc) => doc)
        default:
            ctx.response.body = {
                code: '-1',
                msg: '请求参数错误'
            }
    }
    console.log(res)

})

//添加评论
router.post('/', async (ctx, next) => {
    let { userID, itemID, comment, type } = ctx.request.body,
        date = new Date(),
        current = `${date.getFullYear()}-${
            date.getMonth() + 1
        }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

    if (!userID || !itemID || !comment) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '参数出错',
            }
        })
    }

    let { nickname, avatarPath: userAvatar } = await findAndReturn(
            User,
            userID
        ),
        { itemName, homeImg: itemImg } = await findAndReturn(Goods, itemID)
    // console.log(userName, itemName, comment)

    //创建用户评论对象
    let commentInUser = {
        _id: itemID,
        itemImg: itemImg,
        spec: type,
        itemName: itemName,
        time: current,
        content: comment,
    }

    //创建商品评论对象
    let commentInItem = {
        _id: userID,
        avatar: convertImgPath(userAvatar),
        nickname: nickname,
        time: current,
        content: comment,
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
            code: '200',
            msg: '评论成功',
        }
    })
})

module.exports = router
