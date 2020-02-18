const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
    category: String,
    property: String,
    specs: [{type: mongoose.Types.ObjectId, ref: "Spec"}]
})

module.exports = mongoose.model("Category", categorySchema)
