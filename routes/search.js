// 所有搜索相关的api
const router = require('koa-router')()
const User = require('../models/user')
const Goods = require('../models/goods')
const Category = require('../models/category')
const Spec = require('../models/specification')
const Order = require('../models/order')

router.prefix('/search')

// //后台管理员搜索用户列表
// router.post("/adminusers", async (ctx, next) => {
//     let { keyword } = ctx.request.body
//     if (!keyword) {
//         return next().then(() => {
//             ctx.response.body = {
//                 code: "-1",
//                 msg: "搜索关键字错误"
//             }
//         })
//     }
//     await User.find({
//         $or: [{ nickname: keyword }, { userTel: keyword }]
//     }).then(doc => {
//         if (doc) {
//             ctx.response.body = {
//                 code: "200",
//                 msg: `搜索${keyword}的信息`,
//                 data: doc
//             }
//         }
//     })
// })

// //后台管理员搜索商品列表
// router.post("/admingoods", async (ctx, next) => {
//     let resList = []

//     let { keyword } = ctx.request.body
//     if (!keyword) {
//         return next().then(() => {
//             ctx.response.body = {
//                 code: "-1",
//                 msg: "搜索关键字错误"
//             }
//         })
//     }
//     await Goods.find({ itemName: keyword }).then(doc => {
//         if (doc) {
//             for (const item of doc) {
//                 resList.push(createItem(item))
//             }
//         }
//     })

//     for (let element of resList) {
//         await Category.findOne(
//             { _id: element.junior },
//             { property: 0, category: 0 }
//         )
//             .populate("specs")
//             .then(doc => {
//                 element.styleList = doc.specs
//             })

//         for (let style of element.styleID) {
//             await Spec.findOne(
//                 { "specList._id": style },
//                 { _id: 0, specType: 1, "specList.$": 1 }
//             ).then(doc => {
//                 let _type = doc.specType
//                 let sty = doc.specList[0].style
//                 element.type += `${_type} ${sty} `
//             })
//         }
//     }

//     await next().then(() => {
//         ctx.response.body = {
//             code: "200",
//             msg: `搜索${keyword}`,
//             data: resList
//         }
//     })
// })

//1-用户账号
//2-商品名称
//3-订单id
const createItem = function (obj) {
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
        type: '',
        styleList: null,
    }
    return itemObj
}

router.get('/admin', async (ctx, next) => {
    let { keyword, flag, page, size } = ctx.query,
        res = null,
        total = 0
    switch (flag) {
        case '1':
            const projection = {
                userPassword: 0,
                avatarPath: 0,
                pay: 0,
                qa: 0,
                order: 0,
            }

            res = await User.find({ _id: keyword }, projection)
                .populate([
                    {
                        path: 'addressList',
                    },
                    {
                        path: 'collects',
                    },
                    {
                        path: 'comment',
                    },
                    {
                        path: 'order'
                    }
                ])
                .then((doc) => doc)
            break
        case '2':
            res = []
            await Goods.find({ itemName: new RegExp(`${keyword}`) })
                .skip((page - 1) * size)
                .limit(Number(size))
                .then((doc) => {
                    if (doc) {
                        // console.log(doc)
                        for (const item of doc) {
                            // console.log(doc)
                            res.push(createItem(item))
                        }
                        // console.log(doc)
                    }
                })

            for (let element of res) {
                await Category.findOne(
                    { _id: element.junior },
                    { property: 0, category: 0 }
                )
                    .populate('specs')

                    .then((doc) => {
                        // console.log(doc)
                        element.styleList = doc.specs
                    })

                for (let style of element.styleID) {
                    await Spec.findOne(
                        { 'specList._id': style },
                        { _id: 0, specType: 1, 'specList.$': 1 }
                    ).then((doc) => {
                        let _type = doc.specType
                        let sty = doc.specList[0].style
                        // console.log(`${_type} ${sty}`)
                        element.type += `${_type} ${sty} `
                    })
                }
            }
            break
        case '3':
            res = await Order.find({ orderId: new RegExp(`${keyword}`) })
                .skip((page - 1) * size)
                .limit(Number(size))
                .then((doc) => doc)
            total = await Order.estimatedDocumentCount(
                (error, count) => count
            )
            break
        default:
            ctx.response.body = {
                code: '-1',
                msg: '请求参数错误',
            }
    }
    return next().then(() => {
        ctx.response.body = {
            code: '200',
            msg: '搜索成功',
            data: res,
            total: total
        }
    })
})

//前台搜索栏
router.get('/home', async (ctx, next) => {
    let { keyword } = ctx.query
    // console.log(keyword)
    if (!keyword) {
        return next().then(() => {
            ctx.response.body = {
                code: '404',
                msg: '什么也没有',
            }
        })
    }
    await Category.find(
        { property: new RegExp(`^${keyword}`) },
        { specs: 0, category: 0 }
    )
        .limit(10)
        .then((doc) => {
            ctx.response.body = {
                code: '200',
                data: doc,
            }
        })
})

//前台搜索商品
router.get('/goodslist', async (ctx, next) => {
    let { id, keyword, page } = ctx.query
    const projection = {
        goodsImg: 0,
        stock: 0,
        collectCount: 0,
        rateCount: 0,
        itemDetail: 0,
        junior: 0,
        styleID: 0,
        comment: 0,
    }
    if (id) {
        let total = Goods.countDocuments({ junior: id }, (err, count) => {
            total = count
        })
        await Goods.find({ junior: id }, projection)
            .skip((page - 1) * 12)
            .limit(12)
            .then((doc) => {
                return next().then(() => {
                    ctx.response.body = {
                        code: '200',
                        data: doc,
                        total: total,
                    }
                })
            })
    } else if (keyword) {
        let total = 0
        await Goods.countDocuments(
            { itemName: new RegExp(keyword) },
            (err, count) => {
                total = count
            }
        )
        await Goods.find({ itemName: new RegExp(keyword) }, projection)
            .sort({ itemName: 1 })
            .skip((page - 1) * 12)
            .limit(12)
            .then((doc) => {
                return next().then(() => {
                    ctx.response.body = {
                        code: '200',
                        data: doc,
                        total: total,
                    }
                })
            })
    } else {
        return next().then(() => {
            ctx.response.body = {
                code: '404',
                data: [],
            }
        })
    }
})

module.exports = router
