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

module.exports = mongoose.model("Order", orderSchema)
