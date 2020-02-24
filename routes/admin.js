const router = require("koa-router")()
const jwt = require("jsonwebtoken")

const Admin = require("../models/admin")
const User = require("../models/user")

router.prefix("/admin")

const secret = "UMP45"

router.post("/login", async (ctx, next) => {
    let { account: acc, password: pw } = ctx.request.body
    await Admin.findOne({ account: acc }).then(doc => {
        if (!doc) {
            ctx.response.body = {
                code: "0",
                msg: "没有该帐号"
            }
        } else {
            if (pw === doc.password) {
                let _token = jwt.sign({ account: doc.account }, secret, {
                    expiresIn: "1d"
                })
                ctx.response.body = {
                    code: "1",
                    msg: `${acc}登录成功`,
                    token: _token
                }
            } else {
                ctx.response.body = {
                    code: "-1",
                    msg: `密码错误`
                }
            }
        }
    })
})

router.get("/getuser", async (ctx, next) => {
    let resList = []
    let createUser = obj => {
        let userObj = {
            帐号: obj.userID,
            昵称: obj.nickname,
            姓名: obj.userName,
            性别: obj.userSex,
            生日: obj.birth,
            电话号码: obj.userTel,
            收货地址: obj.addressList,
            用户订单: obj.orderList,
            用户评价: obj.comment,
            优惠券: obj.coupon,
            用户收藏: obj.collect
        }
        return userObj
    }
    await User.find({}).then(doc => {
        if (doc) {
            for (const item of doc) {
                resList.push(createUser(item))
            }
        }
    })
    ctx.response.body = {
        code: "200",
        msg: "请求用户信息成功",
        data: resList
    }
})

module.exports = router
