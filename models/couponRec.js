const mongoose = require('mongoose')

const couponRecSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    coupon: {type: mongoose.Types.ObjectId, ref: 'Coupon'},
    userId: {type: mongoose.Types.ObjectId, ref: 'User'},
    isUsed: Boolean
}, {versionKey: false})

module.exports = mongoose.model('CouponRec', couponRecSchema)
