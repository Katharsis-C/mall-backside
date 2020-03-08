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

const checkAccount = function(account) {
    const emailREG = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    const telREG = /^1[3-9][0-9]{9}$/
    if (emailREG.test(account)) {
        return 1
    }
    if (telREG.test(account)) {
        return 2
    }
    return 0
}

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
                        userID: doc._id,
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

/* 
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
                code: " 1",
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
*/

router.post("/register", async (ctx, next) => {
    const registerByEmail = async function(email, password) {
        await User.findOne({ userEmail: email }).then(doc => {
            if (!doc) {
                let newUser = new User({
                    userEmail: email,
                    userPassword: password
                })
                newUser.save().then(doc)
                return next().then(() => {
                    ctx.response.body = {
                        code: "200",
                        msg: "注册成功"
                    }
                })
            } else {
                return next().then(() => {
                    ctx.response.body = {
                        code: "401",
                        msg: "该邮箱已注册"
                    }
                })
            }
        })
    }

    const registerByTel = async function(tel, password) {
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
                        code: "401",
                        msg: "该手机号码已注册"
                    }
                })
            }
        })
    }

    let { account, password } = ctx.request.body
    if (!account || !password) {
        return next().then(() => {
            ctx.response.body = {
                code: "0",
                msg: "输入有遗漏"
            }
        })
    }
    switch (checkAccount(account)) {
        case 1:
            await registerByEmail(account, password)
            break
        case 2:
            await registerByTel(account, password)
            break
        default:
            return next().then(() => {
                ctx.response.body = {
                    code: "-1",
                    msg: "输入错误"
                }
            })
    }
})

router.post("/info", async (ctx, next) => {
    let { id, nickname, name, gender, birth, tel, email } = ctx.request.body
    let data = {
        nickname: nickname,
        userName: name,
        userSex: gender,
        birth: birth,
        userTel: tel,
        userEmail: email
    }
    try {
        await User.updateOne({ _id: id }, data).then(doc => {})
    } catch (error) {
        ctx.response.body = {
            code: "-1",
            msg: "修改错误"
        }
    }
})
module.exports = router
