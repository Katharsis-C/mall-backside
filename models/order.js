const mongoose = require("mongoose")

const orderSchema = mongoose.Schema(
    {
        _id: mongoose.Types.ObjectId,
        orderId: String,
        orderTime: String,
        item: Array,
        total: Number,
        status: String,
        express: String,
        message: String,
        visible: Boolean
    },
    { versionKey: false }
)
//status "1"-交易未完成 "2"-交易已完成
//visible
module.exports = mongoose.model("Order", orderSchema)
