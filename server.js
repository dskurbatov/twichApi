const Koa = require('koa')
const serve = require('koa-static')

const app = new Koa()

app.use(serve('.'))

app.listen(3000, () => {
  console.log('App is listening on port 3000')
})
