const mongoose = require("mongoose")

const orderSchema = mongoose.Schema(
    {
        _id: mongoose.Types.ObjectId,
        orderId: String,
        orderTime: String,
        item: Array,
        total: Number,
        status: String,
        count: Number
    },
    { versionKey: false }
)
//status "0"-交易未完成 "1"-交易已完成 
module.exports = mongoose.model("Order", orderSchema)
