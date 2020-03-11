const multer = require("@koa/multer")


module.exports = function(dir) {
    const storage = multer.diskStorage({
        destination: function (req,file,cb) {
            cb(null, `public/images/${dir}`)
        },
        filename: function(req, file, cb) {
            let id = req.body.id
            let fileFormat = file.originalname.split(".")
            cb(null, `${id}.${fileFormat[fileFormat.length - 1]}`)
        }
    })
    const upload = multer({storage: storage})
    return upload
}


