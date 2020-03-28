//订单

const router = require("koa-router")()
const mongoose = require("mongoose")
const User = require("../models/user")
const Order = require("../models/order")

router.prefix("/order")

//获取用户订单 需用户id
router.get("/", async (ctx, next) => {
    let { id, status: flag } = ctx.query,
        res = null
        resList = []
    try {
        let userOrder = await User.findOne({ _id: id })
            .populate("order")
            .then(doc => doc.order.filter(item => item.visible === true))
        switch (flag) {
            case "1":
                res = userOrder.filter(value => value.status === "交易未完成")
                break
            case "2":
                res = userOrder.filter(value => value.status === "交易已完成")
                break
            default:
                res = userOrder
        }
        resList = res.filter(item => item.visible === 'true')
        return next().then(() => {
            ctx.response.body = {
                code: "200",
                msg: "请求用户订单成功",
                data: res
            }
        })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "错误"
            }
        })
    }
})

//生成订单 需用户id
router.post("/", async (ctx, next) => {
    try {
        let date = new Date(),
            { goods: itemList, total, userID, message, express } = ctx.request.body,
            current = `${date.getFullYear()}-${date.getMonth() +
                1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
            objID = mongoose.Types.ObjectId(),
            orderModel = new Order({
                _id: objID,
                orderId: current.replace(/[- :]/g, ""),
                item: itemList,
                orderTime: current,
                total: total,
                status: "交易未完成",
                visible: true,
                message: message,
                express: express
            })
        await orderModel.save()
        await User.updateOne(
            { _id: userID },
            { $addToSet: { order: objID } }
        ).then(doc => {
            if (!doc.nModified) {
                ctx.response.body = {
                    code: "-1",
                    msg: "创建订单失败"
                }
            } else {
                ctx.response.body = {
                    code: "200",
                    msg: "创建订单成功"
                }
            }
        })
    } catch (error) {
        await next()
    }
})

//删除订单 需订单id
router.delete("/", async (ctx, next) => {
    try {
        let { id } = ctx.request.body
        await Order.updateOne({ _id: id }, {visible: false}).then(doc => {
            ctx.response.body = {
                code: "200",
                msg: "删除成功"
            }
        })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "删除出错"
            }
        })
    }
})

//到货处理 需要订单id
router.post("/complete", async (ctx, next) => {
    let { id } = ctx.request.body
    await Order.updateOne({ _id: id }, { status: "交易已完成" }).then(doc => {
        if (doc.nModified >= 0) {
            return next().then(() => {
                ctx.response.body = {
                    code: "200",
                    msg: "已确认到货"
                }
            })
        } else {
            return next().then(() => {
                ctx.response.body = {
                    code: "-1",
                    msg: "确认收货出错"
                }
            })
        }
    })
})

module.exports = router
