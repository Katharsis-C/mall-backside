const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userId: Number,
    nickname: String,
    userName: String,
    userEmail: String,
    userPassword: String,
    userSex: String,
    userTel: String,
    birth: String,
    comment: Array,
    addressList: [{
        receiver: String,
        phone: Number,
        province: String,
        city: String,
        district: String,
        location: String,
        isDefault: Boolean
    }],
    avatarPath: String,
    orderList: [{itemName: String, itemStatus: String}],
    coupon: Array,
    collects: Array
},{versionKey: false})

module.exports = mongoose.model('User', userSchema)