const mongoose = require("mongoose")
const User = require("../models/user")
const Goods = require("../models/goods")

module.exports = async function(model, id) {
    let res = await model.findOne({ _id: id }).then(doc => doc)
    return res
}
