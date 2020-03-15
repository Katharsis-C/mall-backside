const router = require("koa-router")()
const News = require("../models/news")
const fs = require('fs')
const userMulter = require("../public/javascripts/koamultr")

const upload = userMulter('news')

router.prefix("/news")

router.get("/", (ctx, next) => {
    ctx.response.body = "this news api"
})

//获取新闻
router.get("/getnews", async (ctx, next) => {
    let { page } = ctx.query
    await News.find({})
        .skip((page - 1) * 10)
        .sort({_id: -1})
        .limit(10)
        .then(doc => {
            if (doc) {
                let resList = doc
                for(let item of resList) {
                    item.picture = `http:127.0.0.1:3000${item.picture.replace(
                        /-/g,
                        `\/`
                    )}`
                }
                ctx.response.body = {
                    code: "200",
                    msg: "获取新闻成功",
                    doc
                }
            }
        })
})

//后台添加新闻
router.post("/" ,async (ctx, next) => {
    let [reqTitle, reqContent] = [
        ctx.request.body.title,
        ctx.request.body.content
    ]
    let news = new News({
        title: reqTitle,
        content: reqContent,
    })

    await news.save().then(doc => {
        ctx.response.body = {
            code: "200",
            msg: "发布新闻成功"
        }
    })
})

//后台修改新闻
router.put("/", upload.single("picture") ,async (ctx, next) => {
    let {_id, title, content} = ctx.request.body
    let pic = ctx.request.file
    let savePath = pic.path.replace(new RegExp("public"), "").replace(/\\/g, "-")
    let news = {
        _id: _id,
        title: title,
        content: content,
        picture: savePath
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

//后台删除新闻
router.delete("/", async (ctx, next) => {
    let id = ctx.request.body._id
    await News.deleteOne({ _id: id }).then(doc => {
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
