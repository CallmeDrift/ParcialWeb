import { Response } from 'express'
import News from '../types/News'

export default class NewsView {
  renderAll(res: Response, newsList: News[]): void {
    res.render('news', { news: newsList })
  }

  renderOne(res: Response, news: News): void {
    res.render('news-details', { news })
  }

}
