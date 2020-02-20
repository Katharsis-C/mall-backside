const router = require("koa-router")()
const Category = require("../models/category")
const Specification = require("../models/specification")

router.prefix("/category")

//获取分类
router.get("/", async function(ctx, next) {
    await Category.find({})
        // .then(doc => {console.log(doc)})
        .populate("specs")
        .then(doc => {
            ctx.response.body = {
                code: "200",
                msg: "获取分类成功",
                doc
            }
        })
})

//添加分类
router.post("/", async (ctx, next) => {
    let data = new Category(ctx.request.body)
    console.log(typeof data.property)
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

//修改分类 需要category._id
router.put("/", async (ctx, next) => {
    let id = ctx.request.body._id
    let data = ctx.request.body.data
    await Category.updateOne({ _id: id }, data)
        .then(doc => {
            console.log(doc)
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

//删除分类 需要category._id
router.delete("/", async (ctx, next) => {
    let id = ctx.request.body._id
    await Category.deleteOne({ _id: id }).then(doc => {
        if (doc.deletedCount === 0) {
            ctx.response.body = {
                code: "404",
                msg: "什么分类也没有删掉..."
            }
        } else {
            ctx.response.body = {
                code: "200",
                msg: "删除成功"
            }
        }
    })
})

//获取属性类别 需要 property

router.post("/getspec", async (ctx, next) => {
    let reqProperty = ctx.request.body.property
    await Category.findOne({ property: reqProperty })
        .populate("specs")
        .then(doc => {
            ctx.response.body = {
                code: "200",
                msg: `获取${reqProperty}的参数成功`,
                doc
            }
        })
})

//添加属性类别 需category._id
router.post("/spec", async (ctx, next) => {
    ctx.response.body = "hello"
    let [cate_id, typeName, typeId] = [
        ctx.request.body.cate_id,
        ctx.request.body.specType,
        null
    ]
    if (!typeName) {
        ctx.response.body = {
            code: "404",
            msg: `添加分类失败`
            // doc
        }
        return next()
    }
    let data = new Specification({ specType: typeName })
    await data.save().then(doc => {
        typeId = doc._id
    })
    await Category.updateOne(
        { _id: cate_id },
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
    let id = ctx.request.body._id
    let data = ctx.request.body.data
    await Specification.updateOne({ _id: id }, data)
        .then(doc => {
            console.log(doc)
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
    let id = ctx.request.body._id
    await Category.updateMany({ $pull: { specs: id } })
    await Specification.deleteOne({ _id: id })
        .populate("specs")
        .then(doc => {
            console.log(doc)
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
    let { _id: id, data } = ctx.request.body
    await Specification.updateOne(
        { _id: id },
        { $addToSet: { specList: data } }
    ).then(doc => {
        ctx.response.body = {
            code: "200",
            msg: `规格 ${data.style} 成功`
            // doc
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
module.exports = router
