const router = require('koa-router')()
const Coupon = require('../models/coupon')
const User = require('../models/user')
const Rec = require('../models/couponRec')
const mongoose = require('mongoose')

router.prefix('/coupon')

//添加券
router.post('/add', async (ctx, next) => {
    let { endTime: date, discount } = ctx.request.body,
        couponModel = new Coupon({
            endTime: date,
            discount: discount,
        })
    await couponModel.save().then(() => {
        ctx.response.body = {
            code: '200',
        }
    })
})

//获取所有券
router.get('/', async (ctx, next) => {
    await Coupon.find({}).then((doc) => {
        ctx.response.body = {
            code: '200',
            data: doc,
        }
    })
})

//获取用户券
router.get('/user', async (ctx, next) => {
    let { userId: id } = ctx.query
    await Rec.find({ userId: id }).populate([
        {
            path: 'coupon', select: 'endTime discount'
        },
    ]).then(doc => {
        if(!!doc) {
            ctx.response.body = {
                code: '200',
                data: doc
            }
        } else {
            ctx.response.body = {
                code: '404',
                msg: '什么券也没有'
            }

        }
    })
})

//领取券
router.post('/get', async (ctx, next) => {
    let { userId, couponId } = ctx.request.body
    try {
        let tmpRec = new Rec({
            _id: mongoose.Types.ObjectId(),
            coupon: couponId,
            userId: userId,
            isUsed: false,
        })
        await User.updateOne(
            { _id: userId },
            { $addToSet: { couponList: tmpRec._id } }
        ).then((doc) => {
            if (doc.nModified !== 0) {
                tmpRec.save()
                ctx.response.body = {
                    code: '200',
                    msg: '领取券成功',
                }
            } else {
                ctx.response.body = {
                    code: '-1',
                    msg: '?',
                }
            }
        })
    } catch (error) {
        return next().then(() => {
            ctx.response.body = {
                code: '-1',
                msg: '请求coupon出错',
            }
        })
    }
})

//使用券
router.post('/use', async (ctx, next) => {
    let { couponId } = ctx.request.body
    await Rec.updateOne({ _id: couponId }, { isUsed: true }).then((doc) => {
        if (doc.nModified !== 0) {
            ctx.response.body = {
                code: '200',
                msg: '使用券成功',
            }
        } else {
            ctx.response.body = {
                code: '-1',
                msg: '?',
            }
        }
    })
})

module.exports = router
