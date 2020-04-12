const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    endTime: String,
    discount: Number,
}, {versionKey: false})

module.exports = mongoose.model('Coupon', couponSchema)
