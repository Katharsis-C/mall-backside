const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    _id: {type: mongoose.Types.ObjectId},
    discount: String
})

module.exports = mongoose.model('Coupon', couponSchema)