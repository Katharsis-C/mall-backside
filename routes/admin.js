const router = require("koa-router")()
const Admin = require("../models/admin")
const jwt = require("jsonwebtoken")

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
                let _token = jwt.sign({account: doc.account}, secret, { expiresIn: "1d" })
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

module.exports = router