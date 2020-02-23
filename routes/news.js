const router = require("koa-router")()
const News = require("../models/news")

router.prefix("/news")

router.get("/", (ctx, next) => {
    ctx.response.body = "this news api"
})

//获取新闻
router.get("/getnews", async (ctx, next) => {
    await News.find({}).then(doc => {
        if (doc) {
            ctx.response.body = {
                code: "200",
                msg: "获取新闻成功",
                doc
            }
        }
    })
})

router.post("/", async (ctx, next) => {
    let [reqId, reqTitle, reqContent, reqPicture] = [
        ctx.request.body._id,
        ctx.request.body.title,
        ctx.request.body.content,
        ctx.request.body.picture
    ]
    let news = new News({
        _id: reqId,
        title: reqTitle,
        content: reqContent,
        picture: reqPicture
    })
    await news.save().then(doc => {
        ctx.response.body = {
            code: "200",
            msg: "发布新闻成功"
        }
    })
})

router.put("/", async (ctx, next) => {
    let news = {
        _id: ctx.request.body._id,
        title: ctx.request.body.title,
        content: ctx.request.body.content,
        picture: ctx.request.body.picture
    }

    await News.updateOne(
        { _id: news._id },
        { title: news.title, content: news.content, picture: news.picture }
    ).then(doc => {
        if (doc.nModified !== 0) {
            ctx.response.body = {
                code: "200",
                msg: "修改新闻成功"
            }
        } else {
            ctx.response.body = {
                code: "404",
                msg: "没有要修改的地方"
            }
        }
    })
})

router.delete("/", async (ctx, next) => {
    let id = ctx.request.body._id
    await News.deleteOne({_id: id}).then(doc => {
        if (doc.deletedCount !== 0) {
            ctx.response.body = {
                code: "200",
                msg: "删除新闻成功"
            }
        } else {
            ctx.response.body = {
                code: "404",
                msg: "没有要删除的新闻"
            }
        }
    })
})

module.exports = router
