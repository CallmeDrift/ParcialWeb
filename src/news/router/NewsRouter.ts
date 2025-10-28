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
    this.router.get('/', (req: Request, res: Response) => {
      const page = Number(req.query['page']) || 1
      const limit = 6
      const allNews = this.model.getAllNews()
      const totalPages = Math.ceil(allNews.length / limit)

      const startIndex = (page - 1) * limit
      const paginatedNews = allNews.slice(startIndex, startIndex + limit)

      this.view.renderAll(res, paginatedNews, page, totalPages)
    })

    this.router.get('/search', (req: Request, res: Response) => {
      const query = req.query['query'] as string
      if (!query || query.trim() === '') {
        return res.redirect('/news')
      }

      const results = this.model.searchNews(query)
      this.view.renderAll(res, results, 1, 1)
    })


    this.router.get('/add', (_req: Request, res: Response) => {
      this.view.renderAddForm(res)
    })

    this.router.post('/add', (req: Request, res: Response) => {
      const { title, summary, content, image, date, comments } = req.body

      if (!title || !summary || !content || !date) {
        return res.status(400).send('Faltan campos obligatorios')
      }

      this.model.saveNews({ title, summary, content, image, date, comments})
      return res.redirect('/news')
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
