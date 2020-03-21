const mongoose = require("mongoose")

const goodsSchema = mongoose.Schema(
    {
        itemName: { type: String, required: true },
        homeImg: { type: String },
        goodsImg: { type: String },
        price: {type: Number, required: true},
        stock: { type: Number, required: true },
        salesCount: { type: Number, required: true },
        collectCount: { type: Number, required: true },
        rateCount: { type: Number, required: true },
        itemDetail: { type: String, required: true },
        junior: { type: String, required: true },
        styleID: { type: Array, required: true },
        comment: [{
            time: String,
            avatar: String,
            userName: String,
            content: String
        }]
    },
    { versionKey: false }
)

module.exports = mongoose.model("Goods", goodsSchema)
