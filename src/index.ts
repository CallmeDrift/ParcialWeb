import express, { Application } from 'express'
import path from 'node:path'
import NewsRouter from './news/router/NewsRouter'
import NewsView from './news/view/NewsView'
import ErrorRouter from './error/router/ErrorRouter'
import ErrorView from './error/view/ErrorView'
import RegisterRouter from './register/router/RegisterRouter'
import RegisterView from './register/view/RegisterView'
import HomeRouter from './home/router/HomeRouter'
import HomeView from './home/view/HomeView'

export default class Server {
  private readonly app: Application

  constructor(
    private readonly newsRouter: NewsRouter,
    private readonly errorRouter: ErrorRouter,
    private readonly registerRouter: RegisterRouter,
    private readonly homeRouter: HomeRouter
  ) {
    this.app = express()
    this.configure()
    this.static()
    this.routes()
  }

  private readonly configure = (): void => {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.set('view engine', 'ejs')
    this.app.set('views', path.join(__dirname, './template'))
  }

  private readonly routes = (): void => {
    this.app.use('/', this.homeRouter.router)
    this.app.use('/news', this.newsRouter.router)
    this.app.use('/add', this.registerRouter.router)
    this.app.use('/{*any}', this.errorRouter.router)
    
  }

  private readonly static = (): void => {
    console.log(__dirname)
    this.app.use(express.static(path.join(__dirname, './public')))
  }

  readonly start = (): void => {
    const port = 1888
    const host = 'localhost'
    this.app.listen(port, () => {
      console.log(`Server is running on http://${host}:${port}`)
    })
  }
}

const server = new Server(
  new NewsRouter(new NewsView()),
  new ErrorRouter(new ErrorView()),
  new RegisterRouter(new RegisterView()),
  new HomeRouter(new HomeView())
)
server.start()
