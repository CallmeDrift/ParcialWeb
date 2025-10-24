import { Router, Request, Response } from 'express'
import NewsModel from '../model/NewsModel'
import NewsView from '../view/NewsView'

export default class NewsRouter {
  public readonly router: Router
  private readonly model: NewsModel
  private readonly view: NewsView

  constructor(view: NewsView) {
    this.router = Router()
    this.model = new NewsModel()
    this.view = view
    this.routes()
  }

  private readonly routes = (): void => {
    this.router.get('/', (_req: Request, res: Response) => {
      const newsList = this.model.getAllNews()
      this.view.renderAll(res, newsList)
    })


    this.router.get('/:id', (req: Request, res: Response) => {
      const id = Number(req.params['id'])
      const newsItem = this.model.getNewsById(id)

      if (!newsItem) {
        return res.status(404).send('Noticia no encontrada')
      }

      return this.view.renderOne(res, newsItem)
    })
  }
}
