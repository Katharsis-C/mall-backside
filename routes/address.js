// 用户的地址

const router = require("koa-router")()
const User = require("../models/user")
const Address = require("../models/address")
const mongoose = require("mongoose")

router.prefix("/address")

//获取用户地址 需用户id
router.get("/", async (ctx, next) => {
    let { id } = ctx.query
    try {
        await User.findOne({ _id: id })
            .populate({
                path: "addressList",
                select: `_id receiver phone province city district location isDefault`
            })
            .then(doc => {
                
                ctx.response.body = {
                    code: "200",
                    msg: "地址列表请求成功",
                    data: doc.addressList
                }
            })
    } catch (error) {
        console.log(error)
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "address error"
            }
        })
    }
})

//添加用户地址 需用户id
router.post("/", async (ctx, next) => {
    let req = ctx.request.body,
        userId = req.id
    const createAddress = function(obj, userID) {
        let add = new Address({
            _id: mongoose.Types.ObjectId(),
            userId: userID,
            receiver: obj.receiver,
            phone: obj.phone,
            province: obj.province,
            city: obj.city,
            district: obj.district,
            location: obj.location,
            isDefault: false
        })
        return add
    }
    try {
        let address = createAddress(req, userId),
            addId = address._id

        await address.save()
        await User.updateOne(
            { _id: userId },
            { $addToSet: { addressList: addId } }
        ).then(doc => {
            ctx.response.body = {
                code: "200",
                msg: "添加地址成功"
            }
        })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "添加地址出错"
            }
        })
    }
})

//删除地址 需地址id
router.delete("/", async (ctx, next) => {
    let { id } = ctx.request.body
    if (!id)
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "删除出错"
            }
        })
    try {
        await Address.deleteOne({ _id: id })
        await User.updateOne(
            { addressList: id },
            { $pull: { addressList: id } }
        ).then(doc => {
            if (doc.nModified !== 0) {
                ctx.response.body = {
                    code: "200",
                    msg: "删除地址成功"
                }
            } else {
                ctx.response.body = {
                    code: "404",
                    msg: "没有要删除的地址"
                }
            }
        })
    } catch (error) {
        ctx.response.body = {
            code: "-1",
            msg: "删除出错"
        }
    }
})

//修改地址 需要地址id
router.put("/", async (ctx, next) => {
    let { address } = ctx.request.body,
        id = address.id
    delete address._id
    try {
        await Address.updateOne({ _id: id }, address).then(doc => {
            if (doc.nModified !== 0) {
                ctx.response.body = {
                    code: "200",
                    msg: "修改地址成功"
                }
            } else {
                ctx.response.body = {
                    code: "404",
                    msg: "没有要改变的地方"
                }
            }
        })
    } catch (error) {
        ctx.response.body = {
            code: "-1",
            msg: "修改地址出错"
        }
    }
})

//设置默认地址 需要用户id和地址id
router.post("/default", async (ctx, next) => {
    let { userId, addressId } = ctx.request.body

    try {
        await Address.updateMany({ userId: userId }, { isDefault: false }).then(
            doc => {
                // console.log(doc)
            }
        )
        await Address.updateOne({ _id: addressId }, { isDefault: true }).then(
            doc => {
                if (doc.nModified !== 0) {
                    ctx.response.body = {
                        code: "200",
                        msg: "设置默认地址成功"
                    }
                } else {
                    ctx.response.body = {
                        code: "404",
                        msg: "它已经是默认地址了"
                    }
                }
            }
        )
    } catch (error) {
        ctx.response.body = {
            code: "-1",
            msg: "设置默认地址出错"
        }
    }
})

module.exports = router
