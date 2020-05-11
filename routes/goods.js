const router = require('koa-router')()
const Goods = require('../models/goods')
const Category = require('../models/category')
const Spec = require('../models/specification')
const fs = require('fs')
const mongoose = require('mongoose')

router.prefix('/goods')

const createItem = function (obj) {
    let itemObj = {
        id: obj._id,
        itemName: obj.itemName,
        oldPrice: obj.oldPrice,
        newPrice: obj.newPrice ? obj.newPrice : undefined,
        stock: obj.stock,
        salesCount: obj.salesCount,
        collectCount: obj.collectCount,
        rateCount: obj.rateCount,
        itemDetail: obj.itemDetail,
        junior: obj.junior,
        styleID: obj.styleID,
        type: '',
        styleList: null,
        homeImg: obj.homeImg,
        goodsImg: obj.goodsImg,
    }
    return itemObj
}

//后台获取商品列表
router.get('/', async (ctx, next) => {
    let resList = []
    let { page, size } = ctx.query,
        total = await Goods.estimatedDocumentCount((error, count) => count)
    await Goods.find({})
        .skip((page - 1) * size)
        .limit(Number(size))
        .then((doc) => {
            if (doc) {
                // console.log(doc)
                for (const item of doc) {
                    // console.log(doc)
                    resList.push(createItem(item))
                }
                // console.log(doc)
            }
        })
    // console.log(resList)
    try {
        for (let element of resList) {
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
    } catch (error) {}

    await next().then(() => {
        // console.log(resList)
        ctx.response.body = {
            code: '200',
            msg: '获取商品列表成功',
            data: resList,
            total: total,
        }
    })
})

//后台添加商品
router.post('/', async (ctx, next) => {
    let obj = ctx.request.body,
        { homeImg, goodsImg } = obj,
        homeImg64 = homeImg
            ? homeImg.replace(/^data:image\/\w+;base64,/, '')
            : undefined,
        homeImgBuffer = homeImg64
            ? new Buffer.from(homeImg64, 'base64')
            : undefined,
        goodsImg64 = goodsImg
            ? goodsImg.replace(/^data:image\/\w+;base64,/, '')
            : undefined,
        goodsImgBuffer = goodsImg64
            ? new Buffer.from(goodsImg64, 'base64')
            : undefined,
        itemObj = {}
    // console.log('homeimg', homeImg)
    // console.log('goodsimg', goodsImg)
    // console.log('homeImg64', homeImg64)
    // console.log('homeImgBuffer', homeImgBuffer)
    // console.log('goodsImg64', goodsImg64)
    // console.log('goodsImgBuffer', goodsImgBuffer)
    // console.log(item)

    try {
        itemObj = new Goods({
            _id: Math.trunc(Math.random() * 10000),
            itemName: obj.itemName,
            oldPrice: obj.oldPrice,
            newPrice: obj.newPrice ? obj.newPrice : undefined,
            stock: obj.stock,
            salesCount: obj.salesCount,
            collectCount: obj.collectCount,
            rateCount: obj.rateCount,
            itemDetail: obj.itemDetail,
            junior: obj.junior,
            styleID: obj.styleID,
            type: '',
            styleList: null,
            homeImg: null,
            goodsImg: null,
        })
        if (!!homeImgBuffer || !!goodsImgBuffer) {
            if (!!homeImgBuffer) {
                fs.writeFile(
                    `./public/images/goods/homeImg/${itemObj._id}.jpg`,
                    homeImgBuffer,
                    (err) => {
                        if (!!err) {
                            console.log(err)
                        }
                    }
                )
                itemObj.homeImg = `-images-goods-homeImg-${itemObj._id}.jpg`
            }
            if (!!goodsImgBuffer) {
                console.log('goodsimg')
                fs.writeFile(
                    `./public/images/goods/goodsImg/${itemObj._id}.jpg`,
                    goodsImgBuffer,
                    (err) => {
                        if (!!err) {
                            console.log(err)
                        }
                    }
                )
                itemObj.goodsImg = `-images-goods-goodsImg-${itemObj._id}.jpg`
            }
        }
        itemObj.save()
        return next().then(() => {
            ctx.response.body = {
                code: '200',
                msg: '添加成功',
            }
        })
    } catch (error) {
        console.log(error)
        ctx.response.body = {
            code: '-1',
            msg: '添加商品失败',
        }
    }
})

//后台修改商品
router.put('/', async (ctx, next) => {
    let req = ctx.request.body
    let id = ctx.request.body.id
    let {homeImg, goodsImg} = req
    delete req.id
    console.log(id)
    // console.log(id)
    // console.log(req)
    // await Goods.updateOne({ _id: id }, req).then((doc) => {
    //     console.log(doc)
    // if (doc.nModified === 0) {
    //     ctx.response.body = {
    //         code: '404',
    //         msg: '没有修改的商品',
    //         // doc
    //     }
    // } else {
    //     ctx.response.body = {
    //         code: '200',
    //         msg: '修改商品信息成功',
    //         // doc
    //     }
    // }
    // })
    try {
        await Goods.updateOne({ _id: id }, { $unset: { newPrice: '' } })
        if(!homeImg) { 
            console.log('no homeImg')
            await Goods.updateOne({ _id: id }, { $unset: { homeImg: '' } })
        }
        if(!goodsImg) {
            console.log('no goodsImg')
            await Goods.updateOne({ _id: id }, { $unset: { goodsImg: '' } })
        }


        if (!!req.homeImg && req.homeImg.indexOf(`-images-goods-`) == -1) {
            // console.log('home')
            let base64Data = req.homeImg.replace(/^data:image\/\w+;base64,/, '')
            let dataBUffer = new Buffer.from(base64Data, 'base64')
            console.log('databuf home', dataBUffer)
            fs.writeFile(
                `./public/images/goods/homeimg/${id}.jpg`,
                dataBUffer,
                (err) => {
                    if (!!err) {
                        console.log(err)
                    } else {
                        console.log('pic')
                    }
                }
            )
            await Goods.updateOne({_id: id}, {homeImg: `-images-goods-homeimg-${id}.jpg`})
        }

        if (!!req.goodsImg && req.goodsImg.indexOf(`-images-goods-`) == -1) {
            console.log('goods')
            let base64Data = req.goodsImg.replace(
                /^data:image\/\w+;base64,/,
                ''
            )
            let dataBUffer = new Buffer.from(base64Data, 'base64')
            console.log('databuf goods', dataBUffer)
            fs.writeFile(
                `./public/images/goods/goodsimg/${id}.jpg`,
                dataBUffer,
                (err) => {
                    if (!!err) {
                        console.log(err)
                    } else {
                        console.log('pic')
                    }
                }
            )
            await Goods.updateOne({_id: id}, {goodsImg: `-images-goods-goodsimg-${id}.jpg`})
        }

        delete req.homeImg
        delete req.goodsImg

        await Goods.updateOne({ _id: id }, req).then((doc) => {
            if (doc.nModified === 0) {
                ctx.response.body = {
                    code: '404',
                    msg: '没有修改的商品',
                    // doc
                }
            } else {
                ctx.response.body = {
                    code: '200',
                    msg: '修改商品信息成功',
                    // doc
                }
            }
        })
    } catch (error) {}
})

//后台删除商品
router.delete('/', async (ctx, next) => {
    let { id } = ctx.request.body
    await Goods.deleteOne({ _id: id }).then((doc) => {
        // console.log(doc)
        if (doc.deletedCount === 0) {
            ctx.response.body = {
                code: '404',
                msg: '什么也没有删掉',
            }
        } else {
            ctx.response.body = {
                code: '200',
                msg: '删除商品成功',
            }
        }
    })
})

//前台首页 随机商品
router.get('/todayrecommend', async (ctx, next) => {
    let { size } = ctx.query
    try {
        await Goods.aggregate([
            { $match: {} },
            { $sample: { size: Number(size) } },
        ]).then((doc) => {
            let resList = []
            for (const item of doc) {
                resList.push(item)
            }
            // console.log(resList)
            return next().then(() => {
                ctx.response.body = {
                    code: '200',
                    msg: '获取成功',
                    data: resList,
                }
            })
        })
    } catch (error) {
        console.log(error)
        ctx.response.body = {
            code: '-1',
            msg: '获取错误',
        }
    }
})

//前台首页 随机分类商品
router.get('/random', async (ctx, next) => {
    try {
        let propId = await Category.aggregate([
            {$match: {}},
            {$sample: {size: 1}}
        ]).then(doc => doc[0]._id)
        let resList = await Goods.find({junior: propId}).then(doc => doc)
        console.log('id', propId)
        // console.log(resList)
        for(const item of resList) {
            item.id = item._id
        }
        return next().then(() => {
            ctx.response.body = {
                code: '200',
                msg: '获取成功',
                data: resList,
            }
        })
    } catch (error) {
        console.log(error)
        ctx.response.body = {
            code: '-1',
            msg: '获取错误',
        }
    }
})

//前台首页 随机分类商品
// router.get('/random', async (ctx, next) => {
//     try {
//         let { size, junior } = ctx.query
//         console.log(junior)
//         let resList = await Goods.aggregate([
//             { $match: { junior: (junior) } },
//             { $sample: { size: Number(size) } },
//         ]).then((doc) => {
//             console.log(doc)
//             return doc
//         })
//         // await Category.findOne({_id: junior}).then(doc => {console.log(doc)})
//         // let resList = await Goods.find({ junior: propId }).then((doc) => doc)
//         // console.log('id', propId)
//         // console.log(resList)
//         return next().then(() => {
//             ctx.response.body = {
//                 code: '200',
//                 msg: '获取成功',
//                 data: resList,
//             }
//         })
//     } catch (error) {
//         console.log(error)
//         ctx.response.body = {
//             code: '-1',
//             msg: '获取错误',
//         }
//     }
// })

//前台商品页
router.get('/item', async (ctx, next) => {
    let item = null
    let styleArr = []
    let styleMap = new Map()
    let { id } = ctx.query
    console.log(id)
    if (!id) {
        return next()
    }
    await Goods.findOne({ _id: id }).then((doc) => {
        item = doc
    })
    await next().then(async () => {
        // console.log(item)
        for (const style of item.styleID) {
            await Spec.findOne(
                { 'specList._id': style },
                { specType: 1, _id: 0, 'specList.$': 1 }
            ).then((doc) => {
                console.log(doc)
                if (!styleMap.has(doc.specType)) {
                    styleMap.set(doc.specType, doc.specList[0].style)
                } else {
                    let tmp = styleMap.get(doc.specType)
                    styleMap.set(
                        doc.specType,
                        `${tmp} ${doc.specList[0].style}`
                    )
                }
            })
        }
        // console.log(styleMap)
        for (const [key, value] of styleMap) {
            styleArr.push({ type: key, style: value.split(' ') })
        }
        item.styleID = styleArr
        ctx.response.body = {
            code: '200',
            data: item,
        }
    })
})

module.exports = router
