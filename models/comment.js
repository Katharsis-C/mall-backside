const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    itemId: { type: String, ref: 'Goods' },
    time: String,
    content: String,
    type: String,
}, {versionKey: false})

module.exports = mongoose.model('Comment', commentSchema)
