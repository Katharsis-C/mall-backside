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
            规格: obj.style
        }
        return itemObj
    }
    await Goods.find({})
    .populate("junior","property")
    .then(doc => {
        if (doc) {
            for (const item of doc) {
                resList.push(createItem(item))
            }
            // console.log(doc)
        }
    })

    console.log(resList)
    let objList = []

    // resList.forEach(async ele => {
    //     objList = objList.concat(ele.规格)
    //     await Category.findOne({ _id: ele.二级分类 }).then(doc => {
    //         ele.二级分类 = doc.property
    //     })
    // })


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
