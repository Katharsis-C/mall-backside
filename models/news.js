const mongoose = require('mongoose')

const newsSchema = mongoose.Schema({
    title: String,
    content: String,
    picture: String
})

module.exports = mongoose.model('News', newsSchema)