const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        account: Number,
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
        couponList: [{ type: mongoose.Types.ObjectId, ref: 'couponRec' }],
        pay: String,
        collects: [{ type: String, ref: 'Goods' }],
        qa: { question: String, answer: String },
    },
    { versionKey: false }
)

module.exports = mongoose.model('User', userSchema)
