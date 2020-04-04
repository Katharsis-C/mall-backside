const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId },
    itemId: { type: mongoose.Types.ObjectId },
    time: String,
    content: String,
    type: String,
})

module.exports = mongoose.model('Comment', commentSchema)
