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
        }),
        res = await News.find({})
            .skip((page - 1) * pageSize)
            .sort({ _id: -1 })
            .limit(Number(pageSize))
            .then((doc) => doc)

    return next().then(() => {
        ctx.response.body = {
            code: '200',
            msg: '获取新闻成功',
            data: res,
            total: total,
        }
    })
})

//后台添加新闻
router.post('/', async (ctx, next) => {
    let {
            _id: id,
            title: reqTitle,
            content: reqContent,
            picture,
        } = ctx.request.body,
        news = null,
        base64Data = null,
        dataBUffer = null
    try {
        if (!!picture) {
            base64Data = picture.replace(/^data:image\/\w+;base64,/, '')
            dataBUffer = new Buffer.from(base64Data, 'base64')
            fs.writeFile(
                `./public/images/news/${id}.jpg`,
                dataBUffer,
                function (err) {
                    if (!!err) {
                        console.log(err)
                    } else {
                        news = new News({
                            _id: id,
                            title: reqTitle,
                            content: reqContent,
                            time: current,
                            picture: `-images-news-${id}.jpg`,
                        })
                        news.save()
                    }
                }
            )
        } else {
            news = new News({
                _id: id,
                title: reqTitle,
                content: reqContent,
                time: current,
            })
            news.save()
        }
        ctx.response.body = {
            code: '200',
            msg: '发布新闻成功',
        }
    } catch (error) {
        ctx.response.body = {
            code: '-1',
            msg: '发布新闻失败',
        }
    }
})

//后台修改新闻
router.put('/', async (ctx, next) => {
    let {
            _id: id,
            title: reqTitle,
            content: reqContent,
            picture,
        } = ctx.request.body,
        base64Data = null,
        dataBUffer = null,
        news = null
    try {
        if (!!picture && picture.indexOf('-images-news-') == -1) {
            base64Data = picture
                ? picture.replace(/^data:image\/\w+;base64,/, '')
                : undefined
            dataBUffer = base64Data
                ? new Buffer.from(base64Data, 'base64')
                : undefined
            console.log(base64Data, dataBUffer)
            fs.writeFile(
                `./public/images/news/${id}.jpg`,
                dataBUffer,
                (err) => {
                    if (!!err) {
                        console.log(err)
                    } else {
                        console.log('pic', news)
                    }
                }
            )
        } else {
            console.log('no pic', news)
        }
        await News.updateOne(
            { _id: id },
            {
                title: reqTitle,
                content: reqContent,
                picture: `-images-news-${id}.jpg`,
            }
        ).then((doc) => {
            console.log(doc)
            if (doc.nModified !== 0) {
                ctx.response.body = {
                    code: '200',
                    msg: '修改地址成功',
                }
            } else {
                ctx.response.body = {
                    code: '404',
                    msg: '没有要改变的地方',
                }
            }
        })
    } catch (error) {
        console.log(error)
        ctx.response.body = {
            code: '-1',
            msg: '修改出错',
        }
    }
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
