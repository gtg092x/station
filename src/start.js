import Koa from 'koa'
import mount from 'koa-mount'
import sim from './sim'
import { nextColor } from './state'

const {
  PORT = 3070
} = process.env

const app = new Koa()

app.use(mount('/color', nextColor))
app.use(sim)

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
