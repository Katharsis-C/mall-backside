//订单

const router = require('koa-router')()
const mongoose = require('mongoose')
const User = require('../models/user')
const Order = require('../models/order')

router.prefix('/order')

//前台获取用户订单 需用户id
router.get('/', async (ctx, next) => {
    let { id, status: flag } = ctx.query,
        res = null
    try {
        let userOrder = await User.findOne({ _id: id })
            .populate([{ path: 'order' }])
            .then(doc => doc.order.filter(item => item.visible === true))
        switch (flag) {
            case '1':
                res = userOrder.filter(value => value.status == '未发货')
                break
            case '2':
                res = userOrder.filter(value => value.status == '已发货')
                break
            case '3':
                res = userOrder.filter(value => value.status == '申请退货')
                break
            case '4':
                res = userOrder.filter(value => value.status == '退货成功')
                break
            case '5':
                res = userOrder.filter(value => value.status == '退货失败')
                break
            case '6':
                res = userOrder.filter(value => value.status == '已收货')
                break
            default:
                res = userOrder
        }

        return next().then(() => {
            ctx.response.body = {
                code: '200',
                msg: '请求用户订单成功',
                data: res
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

//生成订单 需用户id
router.post('/', async (ctx, next) => {
    try {
        let date = new Date(),
            {
                goods: itemList,
                total,
                userID,
                message,
                express,
                address
            } = ctx.request.body,
            current = `${date.getFullYear()}-${date.getMonth() +
                1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
            objID = mongoose.Types.ObjectId(),
            orderModel = new Order({
                _id: objID,
                orderId: `${current.replace(
                    /[- :]/g,
                    ''
                )}${date.getMilliseconds()}`,
                item: itemList,
                userId: userID,
                orderTime: current,
                total: total,
                status: '未发货',
                visible: true,
                message: message,
                express: express,
                address: address
            })
        await orderModel.save()
        await User.updateOne(
            { _id: userID },
            { $addToSet: { order: objID } }
        ).then(doc => {
            if (!doc.nModified) {
                ctx.response.body = {
                    code: '-1',
                    msg: '创建订单失败'
                }
            } else {
                ctx.response.body = {
                    code: '200',
                    msg: '创建订单成功'
                }
            }
        })
    } catch (error) {
        await next()
    }
})

//删除订单 需订单id
router.delete('/', async (ctx, next) => {
    try {
        let { id } = ctx.request.body
        await Order.updateOne({ _id: id }, { visible: false }).then(doc => {
            ctx.response.body = {
                code: '200',
                msg: '删除成功'
            }
        })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '删除出错'
            }
        })
    }
})

router.post('/status', async (ctx, next) => {
    let { id, status } = ctx.request.body
    await Order.updateOne({ _id: id }, { status: status }).then(doc => {
        if (doc.nModified != 0) {
            return next().then(() => {
                ctx.response.body = {
                    code: '200',
                    msg: `已将订单状态改为${status}`
                }
            })
        } else {
            return next().then(() => {
                ctx.response.body = {
                    code: '404',
                    msg: `订单状态已经是${status}`
                }
            })
        }
    })
})


// //到货处理 需要订单id
// router.post('/complete', async (ctx, next) => {
//     let { id } = ctx.request.body
//     await Order.updateOne({ _id: id }, { status: '交易已完成' }).then(doc => {
//         if (doc.nModified >= 0) {
//             return next().then(() => {
//                 ctx.response.body = {
//                     code: '200',
//                     msg: '已确认到货'
//                 }
//             })
//         } else {
//             return next().then(() => {
//                 ctx.response.body = {
//                     code: '-1',
//                     msg: '确认收货出错'
//                 }
//             })
//         }
//     })
// })

// //前台申请退货 需要订单id
// router.post('/refund', async (ctx, next) => {
//     let { id } = ctx.request.body
//     await Order.updateOne({ _id: id }, { refund: '申请退货中' }).then(doc => {
//         if (doc.nModified >= 0) {
//             return next().then(() => {
//                 ctx.response.body = {
//                     code: '200',
//                     msg: '已申请退货'
//                 }
//             })
//         } else {
//             return next().then(() => {
//                 ctx.response.body = {
//                     code: '-1',
//                     msg: '请求出错'
//                 }
//             })
//         }
//     })
// })


module.exports = router
