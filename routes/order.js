//订单

const router = require("koa-router")()
const mongoose = require("mongoose")
const User = require("../models/user")
const Order = require("../models/order")

router.prefix("/order")

//获取用户订单 需用户id
router.get("/", async (ctx, next) => {
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
        coupon: 0
    }
    try {
        let { id } = ctx.query
        await User.findOne({ _id: id }, projection)
            .populate("order")
            .then(doc => {
                ctx.response.body = {
                    code: "200",
                    data: doc.order
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
            { goods: itemList, total, userID } = ctx.request.body,
            current = `${date.getFullYear()}-${date.getMonth() +
                1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
            objID = mongoose.Types.ObjectId(),
            orderModel = new Order({
                _id: objID,
                orderId: current.replace(/[- :]/g, ""),
                item: itemList,
                orderTime: current,
                total: total,
                status: "卖家已发货"
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
        if(!id) {
            return next().then(() => {
                ctx.response.body = {
                    code: "-1",
                    msg: "删除出错"
                }
            })
        }
        await Order.deleteOne({ _id: id })
        await User.updateOne({ order: id }, { $pull: { order: id } }).then(doc => {
            if (doc.nModified !== 0) {
                ctx.response.body = {
                    code: "200",
                    msg: "删除订单成功"
                }
            } else {
                ctx.response.body = {
                    code: "404",
                    msg: "没有要删除的订单"
                }
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

module.exports = router
