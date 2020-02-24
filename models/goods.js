const mongoose = require("mongoose")

const goodsSchema = mongoose.Schema({
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
