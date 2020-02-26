const router = require("koa-router")()
const Goods = require("../models/goods")
const Category = require("../models/category")
const Spec = require("../models/specification")

router.prefix("/goods")

router.get("/", async (ctx, next) => {
    let resList = []

    let createItem = function(obj) {
        let itemObj = {
            商品名称: obj.itemName,
            库存数量: obj.stock,
            商品参数: obj.itemDetail,
            销售量: obj.salesCount,
            收藏量: obj.collectCount,
            评价量: obj.rateCount,
            二级分类: obj.junior,
            规格: obj.style,
            规格名: []
        }
        return itemObj
    }
    await Goods.find({}).then(doc => {
        if (doc) {
            for (const item of doc) {
                resList.push(createItem(item))
            }
            // console.log(doc)
        }
    })

    for (let element of resList) {
        await Category.findOne({ _id: element.二级分类 }).then(doc => {
            element.二级分类 = doc.property
        })
        for (let style of element.规格) {
            await Spec.findOne(
                { "specList._id": style },
                { "specList.$": 1 }
            ).then(doc => {
                style = doc.specList[0].style
                element.规格名.push(style)
            })
        }
        delete element.规格
    }

    await next().then(() => {
        ctx.response.body = {
            code: "200",
            msg: "获取商品列表成功",
            data: resList
        }
    })
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
    await item
        .save()
        .then(doc => {
            ctx.response.body = {
                code: "200",
                msg: "添加商品成功"
            }
        })
        .catch(err => {
            console.log(err)
            ctx.response.body = {
                code: "404",
                msg: "添加商品失败"
            }
        })
})

module.exports = router
