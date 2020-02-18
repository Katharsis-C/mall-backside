const mongoose = require("mongoose")

const goodsSchema = mongoose.Schema({
    _id: Number,
    itemName: String,
    itemPic: String,
    price: Number,
    stock: Number,
    discount: String,
    salesCount: Number,
    collectCount: Number,
    rateCount: Number,
    itemDetail: String,
})

module.exports = mongoose.model("Goods", goodsSchema)
