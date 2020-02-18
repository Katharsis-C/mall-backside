const mongoose = require("mongoose")

const specSchema = mongoose.Schema({
    specType: String,                  //规格分类
    specList: [                        //规格列表
        {specification: String}        //规格型号
    ]
})

module.exports = mongoose.model("Spec", specSchema)