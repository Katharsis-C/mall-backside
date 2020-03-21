const router = require("koa-router")()
const Category = require("../models/category")
const Specification = require("../models/specification")

router.prefix("/category")

//获取分类
router.get("/", async function(ctx, next) {
    let createCate = function(id, cate) {
        let cateObj = {
            id: id,
            category: cate,
            isok: true,
            level: "一级",
            children: []
        }
        return cateObj
    }

    let createProp = function(id, prop) {
        let propObj = {
            propID: id,
            property: prop,
            isok: true,
            level: "二级"
        }
        return propObj
    }

    let propMap = new Map()
    let cateSet = new Set()
    let resList = []
    let i = 1
    await Category.find({}).then(doc => {
        doc.forEach(ele => {
            propMap.set(createProp(ele._id, ele.property), ele.category)
            cateSet.add(ele.category)
        })
        cateSet.forEach(ele => {
            resList.push(createCate(i, ele))
            i++
        })
        for (let [key, value] of propMap) {
            for (const cate of resList) {
                // console.log(cate.category)
                if (cate.category === value) {
                    cate.children.push(key)
                }
            }
        }

        // console.log(propMap)
        ctx.response.body = {
            code: "200",
            msg: "获取分类成功",
            resList
        }
    })
})

//添加分类
router.post("/", async (ctx, next) => {
    let data = new Category(ctx.request.body)
    // console.log(typeof data.property)
    if (
        typeof data.category == "undefined" ||
        typeof data.property == "undefined"
    ) {
        ctx.response.body = {
            code: "404",
            msg: `添加失败 检查是否有遗留项`
            // doc
        }
    } else {
        await data.save().then(doc => {
            if (doc) {
                ctx.response.body = {
                    code: "200",
                    msg: `添加分类成功`
                    // doc
                }
            }
        })
    }
})

//修改分类 property._id
router.put("/", async (ctx, next) => {
    let id = ctx.request.body.propID
    let data = ctx.request.body.data
    await Category.updateOne({ _id: id }, data)
        .then(doc => {
            // console.log(doc)
            if (doc.nModified === 0) {
                ctx.response.body = {
                    code: "404",
                    msg: "没有修改内容"
                    // doc
                }
            } else {
                ctx.response.body = {
                    code: "200",
                    msg: "修改成功"
                    // doc
                }
            }
        })
        .catch(err => {
            ctx.response.body = {
                code: "404",
                msg: "修改失败"
            }
        })
})

//删除分类 property._id
router.delete("/", async (ctx, next) => {
    let propid = ctx.request.body.propID
    let id = { _id: propid }
    let speclist = null
    await Category.findOne(id).then(doc => {
        if (!doc) {
            ctx.response.body = {
                code: "404",
                msg: "什么也没有删掉..."
            }
        } else {
            speclist = doc.specs
        }
    })
    await Specification.deleteMany({
        _id: speclist
    })

    await Category.deleteOne(id).then(doc => {
        if (doc.deletedCount === 0) {
            ctx.response.body = {
                code: "404",
                msg: "什么也没有删掉..."
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: "删除成功"
            }
        }
    })
})

//获取属性类别 需要 property._id
router.post("/getspec", async (ctx, next) => {
    let reqProperty = ctx.request.body.property
    await Category.findOne({ _id: reqProperty })
        .populate("specs")
        .then(doc => {
            if (doc) {
                ctx.response.body = {
                    code: "200",
                    msg: `获取${doc.property}的参数成功`,
                    doc
                }
            } else {
                ctx.response.body = {
                    code: "404",
                    msg: `没有找到相关的属性`
                }
            }
        })
    return next()
})

//添加属性类别 需category/property._id
router.post("/spec", async (ctx, next) => {
    let [propID, data, typeId] = [
        ctx.request.body.propID,
        ctx.request.body.data,
        null
    ]
    if (!data) {
        ctx.response.body = {
            code: "404",
            msg: `添加分类失败`
            // doc
        }
        return next()
    }
    let _data = new Specification({ specType: data.specType })
    await _data.save().then(doc => {
        typeId = doc._id
    })
    await Category.updateOne(
        { _id: propID },
        { $addToSet: { specs: typeId } }
    ).then(doc => {
        ctx.response.body = {
            code: "200",
            msg: `添加分类成功`
            // doc
        }
    })
})

//修改属性类别 需要spec._id
router.put("/spec", async (ctx, next) => {
    let id = ctx.request.body.specID
    let data = ctx.request.body.data
    // console.log(data)
    await Specification.updateOne({ _id: id }, data)
        .then(doc => {
            // console.log(doc)
            if (doc.nModified === 0) {
                ctx.response.body = {
                    code: "404",
                    msg: "没有修改的属性"
                    // doc
                }
            } else {
                ctx.response.body = {
                    code: "200",
                    msg: "修改成功"
                    // doc
                }
            }
        })
        .catch(err => {
            ctx.response.body = {
                code: "404",
                msg: "修改失败"
            }
        })
})

//删除属性类 需要Spec._id
router.delete("/spec", async (ctx, next) => {
    let id = ctx.request.body.specID
    await Category.updateMany({ $pull: { specs: id } })
    await Specification.deleteOne({ _id: id })
        .populate("specs")
        .then(doc => {
            // console.log(doc)
            if (doc.deletedCount === 0) {
                ctx.response.body = {
                    code: "404",
                    msg: "什么参数也没有删掉..."
                }
            } else {
                ctx.response.body = {
                    code: "200",
                    msg: "删除成功"
                }
            }
        })
})

//添加规格 需要spec._id
router.post("/specification", async (ctx, next) => {
    let { specID, data } = ctx.request.body
    // console.log(id)
    await Specification.updateMany(
        { _id: specID },
        { $addToSet: { specList: data } }
    ).then(doc => {
        if (doc.nModified === 0) {
            ctx.response.body = {
                code: "404",
                msg: "添加的属性"
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: `规格 ${data.style} 成功`
            }
        }
    })
})

//删除规格 spec._id和style._id
router.delete("/specification", async (ctx, next) => {
    let { specID, styleID } = ctx.request.body
    await Specification.updateMany(
        { _id: specID },
        { $pull: { specList: { _id: styleID } } }
    ).then(doc => {
        if (doc.nModified === 0) {
            ctx.response.body = {
                code: "404",
                msg: "什么规格也没有删掉..."
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: "删除成功"
            }
        }
    })
})

//删除一级分类category
router.delete("/senior", async (ctx, next) => {
    let arr = []
    let { category } = ctx.request.body
    await Category.find({ category: category }).then(doc => {
        for (const ele of doc) {
            arr.push(...ele.specs)
        }
    })
    await Specification.deleteMany({
        _id: arr
    })

    await Category.deleteMany({ category: category }).then(doc => {
        if (doc.deletedCount === 0) {
            ctx.response.body = {
                code: "404",
                msg: "什么也没有删掉"
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: "一级分类删除成功"
            }
        }
    })
})

router.put("/senior", async (ctx, next) => {
    // console.log("hello")
    let { old, newName } = ctx.request.body
    await Category.updateMany({ category: old }, { category: newName }).then(
        doc => {
            if (doc.nModified > 0) {
                ctx.response.body = {
                    code: "200",
                    msg: "修改成功"
                }
            } else {
                ctx.response.body = {
                    code: "404",
                    msg: "修改失败"
                }
            }
        }
    )
})
module.exports = router
