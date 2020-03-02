const router = require("koa-router")()
const mongoose = require("mongoose")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

/**
 * JWT secret
 */
const secret = "UMP45"

//连接数据库
const DB_URL = "mongodb://localhost:27017/learning"
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on("connected", () => {
    console.log(`${DB_URL} connect success`)
})

router.prefix("/users")

router.get("/", function(ctx, next) {
    ctx.body = "this is a users response!"
})

router.post("/login", async (ctx, next) => {
    reqAccount = ctx.request.body.account
    reqPWD = ctx.request.body.password
    await User.findOne({
        $or: [{ userEmail: reqAccount }, { userTel: reqAccount }]
    }).then(doc => {
        if (!doc) {
            ctx.response.body = {
                code: "-1",
                msg: "没有该用户"
            }
        } else {
            if (doc.userPassword === reqPWD) {
                const token = jwt.sign({ _id: doc._id }, secret, {
                    expiresIn: "1h"
                })
                ctx.response.body = {
                    code: 1,
                    message: `${reqAccount} 登录成功`,
                    user: {
                        code: "200",
                        msg: "登录成功",
                        user: doc,
                        token: token
                    }
                }
            } else {
                ctx.response.body = {
                    code: "404",
                    message: `密码错误`
                }
            }
        }
    })
})

router.post("/emailregister", async (ctx, next) => {
    let { email, password } = ctx.request.body
    if (!email || !password) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "提交错误"
            }
        })
    }

    await User.findOne({ userEmail: email }).then(doc => {
        if (!doc) {
            let newUser = new User({
                userEmail: email,
                userPassword: password
            })
            newUser.save()
            return next().then(() => {
                ctx.response.body = {
                    code: "200",
                    msg: "注册成功"
                }
            })
        } else {
            return next().then(() => {
                ctx.response.body = {
                    code: "0",
                    msg: "该邮箱已注册"
                }
            })
        }
    })
})

router.post("/telregister", async (ctx, next) => {
    let { tel, password } = ctx.request.body
    if (!tel || !password) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "提交错误"
            }
        })
    }
    await User.findOne({ userTel: tel }).then(doc => {
        if (!doc) {
            let newUser = new User({
                userTel: tel,
                userPassword: password
            })
            newUser.save()
            return next().then(() => {
                ctx.response.body = {
                    code: "200",
                    msg: "注册成功"
                }
            })
        } else {
            return next().then(() => {
                ctx.response.body = {
                    code: "0",
                    msg: "该手机号码已注册"
                }
            })
        }
    })
})

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
    for(let key in address) {
        if(typeof address[key] === 'undefined') {
            return next().then(() => {
                ctx.response.body = {
                    code: "-1",
                    msg: "填写错误"
                }
            })
        }
    }
    await User.updateOne({_id: req.id}, {$push:{addressList: address}}).then(doc => {
        if(doc.ok === 1 && doc.nModified !== 0) {
            ctx.response.body = {
                code: "200",
                msg: "添加地址成功"
            }
        }
    })
})

module.exports = router
