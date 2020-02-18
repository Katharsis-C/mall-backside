const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userId: Number,
    userName: String,
    userEmail: String,
    userPassword: String,
    userSex: String,
    userTel: String,
    birth: String,
    address: Array,
    orderList: [{itemName: String, itemStatus: String}],
    coupon: Array,
    collects: Array
})

module.exports = mongoose.model('User', userSchema)