const mongoose = require('mongoose')

const orderSchema = mongoose.Schema(
    {
        _id: mongoose.Types.ObjectId,
        orderId: String,
        userId: {type:mongoose.Types.ObjectId, ref:'User'},
        orderTime: String,
        item: Array,
        total: Number,
        status: String,
        express: String,
        message: String,
        address: { type: mongoose.Types.ObjectId, ref: 'Address' },
        visible: Boolean
    },
    { versionKey: false }
)

// case '1':
//     res = userOrder.filter(value => value.status == '未发货')
//     break
// case '2':
//     res = userOrder.filter(value => value.status == '已发货')
//     break
// case '3':
//     res = userOrder.filter(value => value.status == '申请退货')
//     break
// case '4':
//     res = userOrder.filter(value => value.status == '退货成功')
//     break
// case '5':
//     res = userOrder.filter(value => value.status == '退货失败')
//     break
// case '6':
//     res = userOrder.filter(value => value.status == '已收货')


//visible 前台可视状态


module.exports = mongoose.model('Order', orderSchema)
