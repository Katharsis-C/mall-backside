const mongoose = require('mongoose')

const newsSchema = mongoose.Schema({
    time: String,
    title: String,
    content: String,
    picture: String
}, {versionKey: false})

module.exports = mongoose.model('News', newsSchema)