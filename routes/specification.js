const router = require("koa-router")()
const Specification = require("../models/specification")

router.prefix("/specification")

router.post("/", async function(ctx, next) {
    let body = ctx.request.body
    ctx.body = "this is a specification response!"
    await Specification.find({}).then(doc => {
        if (doc) {
            ctx.response.body = {
                code: "200",
                msg: "获取规格信息",
                doc
            }
        }
    })
})

router.post("/", async (ctx, next) => {
    let data = new Specification(ctx.request.body)
    console.log()
    await data.save().then((doc) => {
        if (doc) {
            ctx.response.body = {
                code: "200",
                msg: "添加成功",
                doc
            }
        }
    })
})


module.exports = router
