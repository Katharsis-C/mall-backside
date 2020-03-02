const Koa = require("koa")
const app = new Koa()
const views = require("koa-views")
const json = require("koa-json")
const onerror = require("koa-onerror")
const bodyparser = require("koa-bodyparser")
const logger = require("koa-logger")
const cors = require("koa2-cors")
const koaJwt = require("koa-jwt")
const jwt = require("jsonwebtoken")

const index = require("./routes/index")
const users = require("./routes/users")
const news = require("./routes/news")
const goods = require("./routes/goods")
const category = require("./routes/category")
const admin = require("./routes/admin")

// error handler
onerror(app)

// middlewares
app.use(
    bodyparser({
        enableTypes: ["json", "form", "text"]
    })
)
app.use(json())
app.use(logger())
app.use(require("koa-static")(__dirname + "/public"))

app.use(
    views(__dirname + "/views", {
        extension: "pug"
    })
)

//cors
app.use(cors())

// logger
app.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// // koa jwt
// app.use(
//     koaJwt({
//         secret: "UMP45"
//     }).unless({
//         path: [/^\/admin\/login/, /^\/users\/login/, /^\/users\/[A-z]*register/]
//     })
// )

// verify token
app.use(async (ctx, next) => {
    if (ctx.header && ctx.header.authorization) {
        const parts = ctx.header.authorization.split(" ")
        if (parts.length === 2) {
            //取出token
            const scheme = parts[0]
            const token = parts[1]
            // console.log(`${scheme}\n${token}`)
            if (/^Bearer$/i.test(scheme)) {
                try {
                    // console.log("verify")
                    //jwt.verify方法验证token是否有效
                    jwt.verify(token, "UMP45", {
                        complete: true
                    })
                } catch (error) {
                    console.log(error)
                    ctx.status = 401
                    ctx.body = "未登录或者token过期, 请重新登录"
                }
            }
        }
    }

    return next().catch(err => {
        if (err.status === 401) {
            ctx.status = 401
            ctx.body = "未登录或者token过期, 请重新登录\n"
        } else {
            throw err
        }
    })
})

//401
app.use((ctx, next) => {
    return next().catch(err => {
        if (err.status === 401) {
            ctx.status = 401
            ctx.body =
                "Protected resource, use Authorization header to get access\n"
        } else {
            throw err
        }
    })
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(news.routes(), index.allowedMethods())
app.use(goods.routes(), index.allowedMethods())
app.use(category.routes(), index.allowedMethods())
app.use(admin.routes(), index.allowedMethods())

// error-handling
app.on("error", (err, ctx) => {
    console.error("server error", err, ctx)
})

module.exports = app
