const mongoose = require('mongoose')

const goodsSchema = mongoose.Schema(
    {
        _id: { type: String, required: true },
        itemName: { type: String, required: true },
        homeImg: { type: String },
        goodsImg: { type: String },
        newPrice: { type: Number },
        oldPrice: { type: Number, required: true },
        stock: { type: Number, required: true },
        salesCount: { type: Number, required: true },
        collectCount: { type: Number, required: true },
        rateCount: { type: Number, required: true },
        itemDetail: { type: String },
        junior: { type: String, required: true },
        styleID: { type: Array, required: true },
        comment: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    },
    { versionKey: false }
)

module.exports = mongoose.model('Goods', goodsSchema)
