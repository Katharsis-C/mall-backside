const mongoose = require("mongoose")

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
        comment: [
            {
                time: String,
                itemImg: String,
                itemName: String,
                content: String,
                spec: String
            }
        ],
        addressList: [{ type: mongoose.Types.ObjectId, ref: "Address" }],
        avatarPath: String,
        order: [{ type: mongoose.Types.ObjectId, ref: "Order" }],
        coupon: Array,
        pay: String,
        collects: [{ type: mongoose.Types.ObjectId, ref: "Goods" }],
        qa: { question: String, answer: String }
    },
    { versionKey: false }
)

module.exports = mongoose.model("User", userSchema)
