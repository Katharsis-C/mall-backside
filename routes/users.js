const router = require("koa-router")()
const mongoose = require("mongoose")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const useMulter = require("../public/javascripts/koamultr")

const upload = useMulter("avatar")

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

//登录
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
                    code: "200",
                    msg: "登录成功",
                    userID: doc._id,
                    nickname: doc.nickname,
                    userAvatar: `http:127.0.0.1:3000${doc.avatarPath.replace(
                        /-/g,
                        `\/`
                    )}`,
                    token: token
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

//用户注册
router.post("/register", async (ctx, next) => {
    const registerByEmail = async function(email, password) {
        await User.findOne({ userEmail: email }).then(doc => {
            if (!doc) {
                let newUser = new User({
                    nickname: "default",
                    userEmail: email,
                    userPassword: password,
                    avatarPath: `-images-avatar-default.jpg`,
                    pay: "000000",
                    qa: { question: "默认问题答案是000000", answer: "000000" }
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
                    nickname: "default",
                    userTel: tel,
                    userPassword: password,
                    avatarPath: `-images-avatar-default.jpg`,
                    pay: "000000",
                    qa: { question: "默认问题答案是000000", answer: "000000" }
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

router.get("/info", async (ctx, next) => {
    let { id } = ctx.query
    if (!id) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "请求发生错误"
            }
        })
    } else {
        const projection = {
            _id: 0,
            comment: 0,
            addressList: 0,
            orderList: 0,
            coupon: 0,
            collects: 0
        }
        await User.findOne({ _id: id }, projection).then(doc => {
            doc.avatarPath = doc.avatarPath.replace(/-/g, `\/`)
            ctx.response.body = {
                code: "200",
                data: doc
            }
        })
    }
})

//修改用户信息
router.post("/info", upload.single("avatar"), async (ctx, next) => {
    ctx.body = "info"
    let {
        id,
        nickname,
        userName: name,
        userSex: gender,
        birth,
        userTel: tel,
        userEmail: email
    } = ctx.request.body
    let pic = ctx.request.file
    // console.log(ctx.request.body)
    let data = {
        nickname: nickname,
        userName: name,
        userSex: gender,
        birth: birth,
        userTel: tel,
        userEmail: email
    }
    if (pic) {
        let tmpPath = pic.path.replace(new RegExp("public"), "")
        let savePath = tmpPath.replace(/\\/g, "-")
        Object.assign(data, { avatarPath: savePath })
    }

    try {
        await User.updateOne({ _id: id }, data).then(doc => {
            console.log(doc)
            ctx.response.body = {
                code: "200",
                msg: "修改成功"
            }
        })
    } catch (error) {
        ctx.response.body = {
            code: "-1",
            msg: "修改错误"
        }
    }
})

//修改密码 需要用户id
router.post("/password", async (ctx, next) => {
    let { id, oldPW, newPW } = ctx.request.body
    if (!oldPW || !newPW || !id) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "输入错误"
            }
        })
    }
    await User.findOne({ _id: id }).then(async doc => {
        console.log(oldPW, doc.userPassword)
        if (oldPW === doc.userPassword) {
            await User.updateOne(
                {
                    _id: id
                },
                {
                    userPassword: newPW
                }
            )
            return next().then(() => {
                ctx.response.body = {
                    code: "200",
                    msg: "修改成功"
                }
            })
        } else {
            return next().then(() => {
                ctx.response.body = {
                    code: "0",
                    msg: "密码错误"
                }
            })
        }
    })
})

//修改支付密码 需要用户id
router.post("/pay", async (ctx, next) => {
    let { id, payPassword, userPassword } = ctx.request.body,
        userPW = await User.findOne({ _id: id }).then(doc => {
            return doc.userPassword
        })
    if (userPassword !== userPW) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "验证帐号密码错误"
            }
        })
    }
    await User.updateOne({ _id: id }, { pay: payPassword }).then(doc => {
        ctx.response.body = {
            code: "200",
            msg: "修改支付密码成功"
        }
    })

    console.log(userPW)
})

//设置安全问题
router.post("/qa", async (ctx, next) => {
    let { id, question: que, answer: ans, password } = ctx.request.body
    try {
        userPW = await User.findOne({ _id: id }).then(doc => doc.userPassword)
        if (password !== userPW) {
            return next().then(() => {
                ctx.response.body = {
                    msg: "密码错误",
                    code: "-1"
                }
            })
        } else {
            await User.updateOne(
                { _id: id },
                { question: que, answer: ans }
            ).then(doc => {
                if (doc.nModified !== 0) {
                    return next().then(() => {
                        ctx.response.body = {
                            msg: "设置安全问题成功",
                            code: "200"
                        }
                    })
                }
            })
        }
    } catch (error) {
        ctx.response.body = {
            msg: "安全问题格式错误",
            code: "-1"
        }
    }
})

module.exports = router

// router.get("/avatar", async (ctx, next) => {
//     let { id } = ctx.query
//     await User.findOne({ _id: id }).then(doc => {
//         console.log(decodeURIComponent(doc.avatarPath))
//         ctx.response.body = {
//             avatar: `http:127.0.0.1:3000${doc.avatarPath.replace(/-/g, `\/`)}`
//         }
//     })
// })

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
})  */
