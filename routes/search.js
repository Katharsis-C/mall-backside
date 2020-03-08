// 所有搜索相关的api
const router = require("koa-router")()
const User = require("../models/user")
const Goods = require("../models/goods")
const Category = require("../models/category")
const Spec = require("../models/specification")

router.prefix("/search")

router.post("/adminusers", async (ctx, next) => {
    let { keyword } = ctx.request.body
    if (!keyword) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "搜索关键字错误"
            }
        })
    }
    await User.find({
        $or: [{ nickname: keyword }, { userTel: keyword }]
    }).then(doc => {
        if (doc) {
            ctx.response.body = {
                code: "200",
                msg: `搜索${keyword}的信息`,
                data: doc
            }
        }
    })
})

router.post("/admingoods", async (ctx, next) => {
    let resList = []

    let { keyword } = ctx.request.body
    if (!keyword) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "搜索关键字错误"
            }
        })
    }
    await Goods.find({ itemName: keyword }).then(doc => {
        if (doc) {
            for (const item of doc) {
                resList.push(createItem(item))
            }
        }
    })

    for (let element of resList) {
        await Category.findOne(
            { _id: element.junior },
            { property: 0, category: 0 }
        )
            .populate("specs")
            .then(doc => {
                element.styleList = doc.specs
            })

        for (let style of element.styleID) {
            await Spec.findOne(
                { "specList._id": style },
                { _id: 0, specType: 1, "specList.$": 1 }
            ).then(doc => {
                let _type = doc.specType
                let sty = doc.specList[0].style
                element.type += `${_type} ${sty} `
            })
        }
    }

    await next().then(() => {
        ctx.response.body = {
            code: "200",
            msg: `搜索${keyword}`,
            data: resList
        }
    })
})

router.post("/home", async (ctx, next) => {
    let { keyword } = ctx.request.body
    await Category.find({ property: new RegExp(keyword) }, { specs: 0 , category: 0})
    .limit(10)
    .then(
        doc => {
            ctx.response.body = {
                code: "200",
                data: doc
            }
        }
    )
})

module.exports = router
