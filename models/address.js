const mongoose = require("mongoose")

const addressSchema = mongoose.Schema(
    {
        _id: {type: mongoose.Types.ObjectId},
        userId: {type: mongoose.Types.ObjectId},
        receiver: {type: String, required: true},
        phone: {type: String, required: true},
        province: {type: String, required: true},
        city: {type: String, required: true},
        district: {type: String, required: true},
        location: {type: String, required: true},
        isDefault: {type: Boolean, required: true}
    },
    { versionKey: false }
)

module.exports = mongoose.model("Address", addressSchema)