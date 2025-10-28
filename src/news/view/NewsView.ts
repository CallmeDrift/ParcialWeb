import { Response } from 'express'
import News from '../types/News'

export default class NewsView {
  renderAll(res: Response, newsList: News[], currentPage: number, totalPages: number): void {
    res.render('news', { news: newsList, currentPage, totalPages })
  }

  renderOne(res: Response, news: News): void {
    res.render('news-details', { news })
  }

    renderAddForm(res: Response): void {
    res.render('addnews')
  }
}
