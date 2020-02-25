const mongoose = require("mongoose")

const goodsSchema = mongoose.Schema(
    {
        itemName: { type: String, required: true },
        homeImg: { type: String, required: true },
        goodsImg: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        salesCount: { type: Number, required: true },
        collectCount: { type: Number, required: true },
        rateCount: { type: Number, required: true },
        itemDetail: { type: String, required: true },
        junior: { type:mongoose.Types.ObjectId , ref: "Category", required: true},
        style: [{ type:mongoose.Types.ObjectId , ref: "Spec", required: true}]
    },
    { versionKey: false }
)

module.exports = mongoose.model("Goods", goodsSchema)
