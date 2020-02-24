const router = require("koa-router")()
const Goods = require("../models/goods")

router.prefix("/goods")

router.get("/", async (ctx, next) => {
    let resList = []
    let createItem = function(obj) {
        let itemObj = {
            商品名称: obj.itemName,
            库存数量: obj.stock,
            优惠券: obj.discount,
            商品参数: obj.itemDetail,
            销售量: obj.salesCount,
            收藏量: obj.collectCount,
            评价量: obj.rateCount
        }
        return itemObj
    }
    await Goods.find({}).then(doc => {
        if (doc) {
            for (const item of doc) {
                resList.push(createItem(item))
            }
        }
    })
    ctx.response.body = {
        code: "200",
        msg: "请求商品信息成功",
        data: resList
    }
})

router.post("/", async (ctx, next) => {
    let req = ctx.request.body
    if (JSON.stringify(req) === "{}") {
        ctx.response.body = {
            code: "404",
            msg: "提交数据错误"
        }
        return next()
    }
    let item = new Goods(req)
    await item.save().then(doc => {
        ctx.response.body = {
            code: "200",
            msg: "添加商品成功"
        }
    })
})

module.exports = router
