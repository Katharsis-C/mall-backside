const router = require('koa-router')()
const News = require('../models/news')
const fs = require('fs')
const userMulter = require('../utils/koamultr')

const upload = userMulter('news')
const convertImgPath = require('../utils/convertImgPath')

router.prefix('/news')

router.get('/', (ctx, next) => {
    ctx.response.body = 'this news api'
})

const date = new Date()

const current = `${date.getFullYear()}-${
    date.getMonth() + 1
}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

//获取新闻
router.get('/getnews', async (ctx, next) => {
    let { page, pageSize } = ctx.query,
        total = await News.estimatedDocumentCount((err, count) => {
            if (err) {
            } else {
                return count
            }
        })
    await News.find({})
        .skip((page - 1) * pageSize)
        .sort({ _id: -1 })
        .limit(Number(pageSize))
        .then((doc) => {
            if (doc) {
                let resList = doc
                for (let item of resList) {
                    item.picture = convertImgPath(item.picture)
                }
                // console.log(resList)
                ctx.response.body = {
                    code: '200',
                    msg: '获取新闻成功',
                    total: total,
                    data: resList,
                }
            }
        })
})

//后台添加新闻
router.post('/', async (ctx, next) => {
    let { title: reqTitle, content: reqContent, picture } = ctx.request.body,
        base64Data = picture.replace(/^data:image\/\w+;base64,/, ''),
        dataBUffer = new Buffer.from(base64Data, 'base64'),
        news = null
    try {
        fs.writeFile(`./public/images/news/${reqTitle}.jpg`, dataBUffer, function (
            err
        ) {
            if (!!err) {
                console.log(err)
            } else {
                news = new News({
                    title: reqTitle,
                    content: reqContent,
                    time: current,
                    picture: `-images-news-${reqTitle}.jpg`,
                })
                news.save()
            }
        })
        ctx.response.body = {
            code: '200',
            msg: '发布新闻成功'
        }
    
    } catch (error) {
        ctx.response.body = {
            code: '-1',
            msg: '发布新闻失败'
        }
    }
})

//后台修改新闻
router.put('/', async (ctx, next) => {
    let { _id, title, content } = ctx.request.body
    let pic = ctx.request.file
    let savePath = pic.path
        .replace(new RegExp('public'), '')
        .replace(/\\/g, '-')
    let news = {
        time: current,
        _id: _id,
        title: title,
        content: content,
        picture: savePath,
    }
    await News.updateOne(
        { _id: news._id },
        {
            time: news.time,
            title: news.title,
            content: news.content,
            picture: news.picture,
        }
    ).then((doc) => {
        if (doc.nModified !== 0) {
            ctx.response.body = {
                code: '200',
                msg: '修改新闻成功',
            }
        } else {
            ctx.response.body = {
                code: '404',
                msg: '没有要修改的地方',
            }
        }
    })
})

//后台删除新闻
router.delete('/', async (ctx, next) => {
    let id = ctx.request.body._id
    await News.deleteOne({ _id: id }).then((doc) => {
        if (doc.deletedCount !== 0) {
            ctx.response.body = {
                code: '200',
                msg: '删除新闻成功',
            }
        } else {
            ctx.response.body = {
                code: '404',
                msg: '没有要删除的新闻',
            }
        }
    })
})

module.exports = router
