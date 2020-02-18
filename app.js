const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const koaJwt = require('koa-jwt')


const index = require('./routes/index')
const users = require('./routes/users')
const news = require('./routes/news')
const goods = require('./routes/goods')
const category = require('./routes/category')
const spec = require('./routes/specification')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// app.use((ctx, next) => {
//     return next().catch((err) => {
//         if(err.status === 401){
//             ctx.status = 401;
//             ctx.body = 'Protected resource, use Authorization header to get access\n';
//         }else{
//             throw err;
//         }
//     })
// })
// app.use(koaJwt({
//     secret:'UMP45'
// }).unless({
//     path:[/\/login/]
// })
// )



// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(news.routes(), index.allowedMethods())
app.use(goods.routes(), index.allowedMethods())
app.use(category.routes(), index.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
