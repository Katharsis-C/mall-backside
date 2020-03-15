const router = require("koa-router")()
const jwt = require("jsonwebtoken")

const Admin = require("../models/admin")
const User = require("../models/user")

router.prefix("/admin")

const secret = "UMP45"
// const createUser = obj => {
//     let userObj = {
//         id: obj._id,
//         account: obj.userID,
//         nickName: obj.nickname,
//         fullName: obj.userName,
//         gender: obj.userSex,
//         birth: obj.birth,
//         phoneNum: obj.userTel,
//         address: obj.addressList,
//         order: obj.order,
//         comment: obj.comment,
//         coupon: obj.coupon,
//         collection: obj.collects
//     }
//     return userObj
// }

router.post("/login", async (ctx, next) => {
    let { account: acc, password: pw } = ctx.request.body
    await Admin.findOne({ account: acc }).then(doc => {
        if (!doc) {
            ctx.response.body = {
                code: "0",
                msg: "没有该帐号"
            }
        } else {
            if (pw === doc.password) {
                let _token = jwt.sign({ account: doc.account }, secret, {
                    expiresIn: "1d"
                })
                ctx.response.body = {
                    code: "1",
                    msg: `${acc}登录成功`,
                    token: _token
                }
            } else {
                ctx.response.body = {
                    code: "-1",
                    msg: `密码错误`
                }
            }
        }
    })
})

router.get("/getuser", async (ctx, next) => {
    const projection = {
        userEmail: 0,
        userPassword: 0,
        avatarPath: 0,   
        "addressList._id": 0,
        "addressList.isDefault": 0,
        "addressList.phont": 0,
        "addressList.receiver": 0,
        "comment._id": 0

    }
    await User.find({}, projection)
        .populate({path: "order", select:"item.name item.type orderId orderTime status"})
        .then(doc => {
            if (doc) {
                ctx.response.body = {
                    code: "200",
                    msg: "请求用户信息成功",
                    data: doc
                }
            } else {
                return next()
            }
        })
    // ctx.response.body = {
    //     code: "200",
    //     msg: "请求用户信息成功",
    //     data: resList
    // }
})

router.post("/search", async (ctx, next) => {
    let { keyword } = ctx.request.body
    if (!keyword) {
        return next().then(() => {
            ctx.response.body = {
                code: "-1",
                msg: "搜索关键字错误"
            }
        })
    }
    await User.find({
        $or: [{ nickname: keyword }, { userTel: keyword }]
    }).then(doc => {
        if (doc) {
            ctx.response.body = {
                code: "200",
                msg: `搜索${keyword}的信息`,
                data: doc
            }
        }
    })
})

module.exports = router
