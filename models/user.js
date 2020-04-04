const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        userId: Number,
        nickname: String,
        userName: String,
        userEmail: String,
        userPassword: String,
        userSex: String,
        userTel: String,
        birth: String,
        comment: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
        addressList: [{ type: mongoose.Types.ObjectId, ref: 'Address' }],
        avatarPath: String,
        order: [{ type: mongoose.Types.ObjectId, ref: 'Order' }],
        coupon: Array,
        pay: String,
        collects: [{ type: mongoose.Types.ObjectId, ref: 'Goods' }],
        qa: { question: String, answer: String },
    },
    { versionKey: false }
)

module.exports = mongoose.model('User', userSchema)
