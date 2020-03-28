module.exports = function(path) {
    return `http://127.0.0.1:3000${path.replace(
        /-/g,
        `\/`
    )}`
}

//path转换成带127.0.0.1的地址