const router = require('koa-router')()
const Goods = require('../models/goods')
const User = require('../models/user')
const Comment = require('../models/comment')
const mongoose = require('mongoose')
const Order = require('../models/order')

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

    //1-获罪用户评论  2-获取商品评论
    let { commentType, id, page, size } = ctx.query,
        resList = [],
        res = null,
        total = 0
    switch (commentType) {
        case '1':
            res = await Comment.find({ userId: id })
                .populate({ path: 'itemId', select: 'itemName homeImg' })
                .skip(size * (page - 1))
                .limit(Number(size))
                .then((doc) => {
                    console.log(doc)
                    for (const item of doc) {
                        try {
                            let { itemId, type, time, content } = item
                            let { itemName, homeImg } = itemId
                            let tmpObj = {
                                itemName,
                                type,
                                time,
                                homeImg: homeImg,
                                content,
                            }
                            resList.push(tmpObj)
                        } catch (error) {
                            console.log(error)
                        }
                    }

                    return resList
                })
            total = await Comment.countDocuments(
                { userId: id },
                (count) => count
            )
            break
        case '2':
            res = await Comment.find({ itemId: id })
                .populate({ path: 'userId', select: 'nickname avatarPath' })
                .skip(size * (page - 1))
                .limit(Number(size))
                .then((doc) => {
                    for (const item of doc) {
                        let { userId, type, time, content } = item
                        let { nickname, avatarPath } = userId
                        let tmpObj = {
                            avatarPath: avatarPath,
                            nickname,
                            type,
                            time,
                            content,
                        }
                        resList.push(tmpObj)
                    }
                    return resList
                })
            total = await Comment.countDocuments(
                { itemId: id },
                (count) => count
            )
            break
        default:
            ctx.response.body = {
                code: '-1',
                msg: '请求参数错误',
            }
    }
    return next().then(() => {
        ctx.response.body = {
            code: '200',
            msg: '请求评论成功',
            data: res,
            total: total,
        }
    })
})

//添加评论
router.post('/', async (ctx, next) => {
    let {
            userID: userId,
            itemID: itemId,
            comment: content,
            type,
            orderId,
        } = ctx.request.body,
        date = new Date(),
        current = `${date.getFullYear()}-${
            date.getMonth() + 1
        }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

    if (!userId || !itemId || !content || !type) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '参数出错',
            }
        })
    }

    const commentObj = new Comment({
        _id: mongoose.Types.ObjectId(),
        userId,
        itemId,
        content,
        type,
        time: current,
    })

    await Goods.updateOne({ _id: itemId }, { $inc: { rateCount: 1 } })
    await User.updateOne(
        { _id: userId },
        { $addToSet: { comment: commentObj._id } }
    )
    await Goods.updateOne(
        { _id: itemId },
        { $addToSet: { comment: commentObj._id } }
    )

    await commentObj.save().then(async () => {
        await Order.updateOne({ orderId: orderId }, { status: '已评价' })
        ctx.response.body = {
            code: '200',
            msg: '评论成功',
        }
    })

    // let { nickname, avatarPath: userAvatar } = await findAndReturn(
    //         User,
    //         userID
    //     ),
    //     { itemName, homeImg: itemImg } = await findAndReturn(Goods, itemID)
    // // console.log(userName, itemName, comment)

    // //创建用户评论对象
    // let commentInUser = {
    //     _id: itemID,
    //     itemImg: itemImg,
    //     spec: type,
    //     itemName: itemName,
    //     time: current,
    //     content: comment,
    // }

    // //创建商品评论对象
    // let commentInItem = {
    //     _id: userID,
    //     avatar: convertImgPath(userAvatar),
    //     nickname: nickname,
    //     time: current,
    //     content: comment,
    // }

    // // console.log(commentInItem, commentInUser)
    // await User.updateOne(
    //     { _id: userID },
    //     { $addToSet: { comment: commentInUser } }
    // )
    // await Goods.updateOne(
    //     { _id: itemID },
    //     { $addToSet: { comment: commentInItem } }
    // )
    // await next().then(() => {
    // ctx.response.body = {
    //     code: '200',
    //     msg: '评论成功',
    // }
    // })
})

module.exports = router
