const router = require("koa-router")()
const Goods = require("../models/goods")
const Category = require("../models/category")
const Spec = require("../models/specification")

router.prefix("/goods")

const createItem = function(obj) {
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

//后台获取商品列表
router.get("/", async (ctx, next) => {
    let resList = []
    let {page} = ctx.query
    await Goods.find({})
        .skip((page - 1) * 10)
        .limit(10)
        .then(doc => {
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

//后台添加商品
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

//后台修改商品
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

//后台删除商品
router.delete("/", async (ctx, next) => {
    await Goods.deleteOne({ _id: ctx.request.body }).then(doc => {
        // console.log(doc)
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

//前台首页 随机商品
router.get("/todayrecommend", async (ctx, next) => {
    let createObj = obj => {
        let tmp = {
            id: obj._id,
            img: obj.homeImg,
            name: obj.itemName,
            price: obj.price
        }
        return tmp
    }
    try {
        await Goods.aggregate([{ $match: {} }, { $sample: { size: 3 } }]).then(
            doc => {
                let resList = []
                for (const item of doc) {
                    resList.push(createObj(item))
                }
                // console.log(resList)
                return next().then(() => {
                    ctx.response.body = {
                        code: "200",
                        msg: "获取成功",
                        data: resList
                    }
                })
            }
        )
    } catch {
        ctx.response.body = {
            code: "-1",
            msg: "获取错误"
        }
    }
})

//前台商品页
router.get("/item", async (ctx, next) => {
    let item = null
    let styleArr = []
    let styleMap = new Map()
    let { id } = ctx.query
    console.log(id)
    if (!id) {
        return next()
    }
    await Goods.findOne({ _id: id }).then(doc => {
        item = doc
    })
    await next().then(async () => {
        // console.log(item)
        for (const style of item.styleID) {
            await Spec.findOne(
                { "specList._id": style },
                { specType: 1, _id: 0, "specList.$": 1 }
            ).then(doc => {
                console.log(doc)
                if(!styleMap.has(doc.specType)) {
                    styleMap.set(doc.specType, doc.specList[0].style)
                } else {
                    let tmp = styleMap.get(doc.specType)
                    styleMap.set(doc.specType, `${tmp} ${doc.specList[0].style}`)
                }
            })
        }
        // console.log(styleMap)
        for(const [key,value] of styleMap) {
            styleArr.push({type: key, style: value.split(" ")})
        }
        item.styleID = styleArr
        ctx.response.body = {
            code: "200",
            data: item
        }
    })
})

module.exports = router
