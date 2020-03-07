// 用户的地址api

const router = require("koa-router")()
const User = require("../models/user")

router.post("/address", async (ctx, next) => {
    const createAddress = function(obj) {
        let add = {
            receiver: obj.receiver,
            phone: obj.phone,
            province: obj.province,
            city: obj.city,
            district: obj.district,
            location: obj.location,
            isDefault: false
        }
        return add
    }
    let req = ctx.request.body
    let address = createAddress(req)
    for (let key in address) {
        if (typeof address[key] === "undefined") {
            return next().then(() => {
                ctx.response.body = {
                    code: "-1",
                    msg: "填写错误"
                }
            })
        }
    }
    await User.updateOne(
        { _id: req.id },
        { $push: { addressList: address } }
    ).then(doc => {
        if (doc.ok === 1 && doc.nModified !== 0) {
            ctx.response.body = {
                code: "200",
                msg: "添加地址成功"
            }
        }
    })
})

router.delete("/address", async(ctx, next) => {
    let {id} = ctx.request.body
    if(!id) return next().then(() => {
        ctx.response.body = {
            code: "-1",
            msg: "删除出错"
        }
    })
    await User.updateOne({"addressList._id": id},{$pull:{addressList:{_id: id}}}).then(doc => {
        if (doc.deletedCount !== 0) {
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
})


module.exports = router
