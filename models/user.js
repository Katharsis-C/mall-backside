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
    addressList: Array,
    orderList: [{itemName: String, itemStatus: String}],
    coupon: Array,
    collects: Array
},{versionKey: false})

module.exports = mongoose.model('User', userSchema)