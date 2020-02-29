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
            id: obj._id,
            account: obj.userID,
            nickName: obj.nickname,
            fullName: obj.userName,
            gender: obj.userSex,
            birth: obj.birth,
            phoneNum: obj.userTel,
            address: obj.addressList,
            orderList: obj.orderList,
            comment: obj.comment,
            coupon: obj.coupon,
            collecttion: obj.collects
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
