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
                itemImg: String,
                itemName: String,
                content: String
            }
        ],
        addressList: [
            {
                type: mongoose.Types.ObjectId, ref :"Address"
            }
        ],
        avatarPath: String,
        order: [{type: mongoose.Types.ObjectId, ref: "Order"}],
        coupon: Array,
        collects: [{type: mongoose.Types.ObjectId, ref: "Goods"}]
    },
    { versionKey: false }
)

module.exports = mongoose.model("User", userSchema)
