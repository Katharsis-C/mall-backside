const router = require('koa-router')()
const mongoose = require('mongoose')
const Goods = require('../models/goods')

router.prefix('/goods')

router.get('/', async (ctx, next) => {
    await Goods.find({}).then(doc => {
        if (doc) {
            ctx.response.body = {
                code: "200",
                msg: "获取商品信息",
                doc
            }
        }
    })
})

router.post('/', async (ctx, next) => {
    let item = new Goods(ctx.request.body)
    item.save()
})

module.exports = router