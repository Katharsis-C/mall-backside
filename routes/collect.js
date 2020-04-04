// 收藏

const router = require('koa-router')()
const User = require('../models/user')

router.prefix('/collect')

//需要用户id
router.get('/', async (ctx, next) => {
    const projection = {
        userId: 0,
        nickname: 0,
        userName: 0,
        userEmail: 0,
        userPassword: 0,
        userSex: 0,
        userTel: 0,
        birth: 0,
        comment: 0,
        addressList: 0,
        avatarPath: 0,
        coupon: 0,
        order: 0,
        qa: 0,
        pay: 0
    }
    let { id } = ctx.query
    try {
        await User.findOne({ _id: id }, projection)
            .populate({
                path: 'collects',
                select: '_id itemName price price salesCount homeImg'
            })
            .then(doc => {
                ctx.response.body = {
                    code: '200',
                    data: doc.collects
                }
            })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '错误'
            }
        })
    }
})

//添加收藏到用户 需用户的id和商品的id
router.post('/', async (ctx, next) => {
    let { userID, itemID } = ctx.request.body
    try {
        await User.updateOne(
            { _id: userID },
            { $addToSet: { collects: itemID } }
        ).then(doc => {
            if (doc.nModified !== 0) {
                ctx.response.body = {
                    code: '200',
                    msg: '添加收藏成功'
                }
            } else {
                ctx.response.body = {
                    code: '404',
                    msg: '已经在收藏中'
                }
            }
        })
    } catch (error) {}
})

//删除收藏 需用户的id和商品的id
router.delete('/', async (ctx, next) => {
    let { userID, itemID } = ctx.request.body
    if (!userID || !itemID) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '错误'
            }
        })
    }
    try {
        await User.updateOne(
            { _id: userID },
            { $pull: { collects: itemID } }
        ).then(doc => {
            if (doc.nModified !== 0) {
                ctx.response.body = {
                    code: '200',
                    msg: '删除收藏成功'
                }
            } else {
                ctx.response.body = {
                    code: '404',
                    msg: '没有要删除的收藏商品'
                }
            }
        })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '错误'
            }
        })
    }
})

router.post('/', async(ctx, next) =>{
    
})

module.exports = router
