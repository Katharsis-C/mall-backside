const router = require("koa-router")()
const mongoose = require("mongoose")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

/**
 * JWT secret
 */
const secret = "UMP45"

//连接数据库
const DB_URL = "mongodb://localhost:27017/learning"
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on("connected", () => {
    console.log(`${DB_URL} connect success`)
})

router.prefix("/users")

router.get("/", function(ctx, next) {
    ctx.body = "this is a users response!"
})



// router.post("/login", async (ctx, next) => {
//     reqAccount = ctx.request.body.account
//     reqPWD = ctx.request.body.password
//     await User.findOne({
//         $or: [{ userEmail: reqAccount }, { userTel: reqAccount }]
//     }).then(doc => {
//         if (!doc) {
//             ctx.response.body = {
//                 code: "0",
//                 msg: "user not found"
//             }
//         } else {
//             if (doc.userPassword === reqPWD) {
//                 const token = jwt.sign(doc.userID, secret, { expiresIn: '1h' })
//                 ctx.response.body = {
//                     code: 1,
//                     message: `${reqAccount} login success`,
//                     user: {
//                         user_id: doc.userID,
//                         token}
//                     }
//                 ctx.response.body = {
//                     code: "200",
//                     message: `login success`,
//                     doc
//                 }
//             } else {
//                 ctx.response.body = {
//                     code: "404",
//                     message: `password error`
//                 }
//             }
//         }
//     })
// })



module.exports = router
