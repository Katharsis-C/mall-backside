const router = require("koa-router")()
const Goods = require("../models/goods")
const Category = require("../models/category")
const Spec = require("../models/specification")

router.prefix("/goods")

router.get("/", async (ctx, next) => {
    let resList = []

    let createItem = function(obj) {
        let itemObj = {
            id: obj._id,
            itemName: obj.itemName,
            homeImg: obj.homeImg,
            goodsImg: obj.goodsImg,
            price: obj.price,
            stock: obj.stock,
            salesCount: obj.salesCount,
            collectCount: obj.collectCount,
            rateCount: obj.rateCount,
            itemDetail: obj.itemDetail,
            junior: obj.junior,
            styleID: obj.styleID,
            type: "",
            styleList: null
        }
        return itemObj
    }
    await Goods.find({}).then(doc => {
        if (doc) {
            // console.log(doc)
            for (const item of doc) {
                // console.log(doc)
                resList.push(createItem(item))
            }
            // console.log(doc)
        }
    })

    for (let element of resList) {
        await Category.findOne(
            { _id: element.junior },
            { property: 0, category: 0 }
        )
            .populate("specs")
            .then(doc => {
                // console.log(doc)
                element.styleList = doc.specs
            })

        for (let style of element.styleID) {
            await Spec.findOne(
                { "specList._id": style },
                { _id: 0, specType: 1, "specList.$": 1 }
            ).then(doc => {
                let _type = doc.specType
                let sty = doc.specList[0].style
                // console.log(`${_type} ${sty}`)
                element.type += `${_type} ${sty} `
            })
        }
    }

    await next().then(() => {
        // console.log(resList)
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
        .then(() => {
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

router.put("/", async (ctx, next) => {
    let req = ctx.request.body
    let id = ctx.request.body.id
    delete req.id
    // console.log(id)
    // console.log(req)
    await Goods.updateOne({ _id: id }, req).then(doc => {
        console.log(doc)
        if (doc.nModified === 0) {
            ctx.response.body = {
                code: "404",
                msg: "没有修改的商品"
                // doc
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: "修改商品信息成功"
                // doc
            }
        }
    })
})

router.delete("/", async (ctx, next) => {
    await Goods.deleteOne({ _id: ctx.request.body }).then(doc => {
        console.log(doc)
        if (doc.deletedCount === 0) {
            ctx.response.body = {
                code: "404",
                msg: "什么也没有删掉"
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: "删除商品成功"
            }
        }
    })
})

module.exports = router
