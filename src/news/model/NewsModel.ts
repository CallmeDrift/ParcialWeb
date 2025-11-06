import path from "node:path"
import fs from "node:fs"
import News from "../types/News"

export default class NewsModel {
  private readonly filePath: string

  constructor() {
    this.filePath = path.join(__dirname, '../../../database/news.json')
  }

  getAllNews(): News[] {
    const data = fs.readFileSync(this.filePath, 'utf-8')
    return JSON.parse(data) as News[]
  }

  getNewsById(id: number): News | undefined {
    const newsList = this.getAllNews()
    return newsList.find(news => news.id === id)
  }

  searchNews(query: string): News[] {
    const allNews = this.getAllNews();
    return allNews.filter(news =>
      news.title.toLowerCase().includes(query.toLowerCase()) ||
      news.content.toLowerCase().includes(query.toLowerCase()) ||
      news.summary.toLowerCase().includes(query.toLowerCase())
    );
  }

  saveNews(newsData: Omit<News, 'id'>): void {
    const data = fs.readFileSync(this.filePath, 'utf-8')
    const newsList = JSON.parse(data) as News[]

    const last = newsList[newsList.length - 1]
    const newId = last ? last.id + 1 : 1
    const newNews: News = { id: newId, ...newsData }

    newsList.push(newNews)
    fs.writeFileSync(this.filePath, JSON.stringify(newsList, null, 2))
  }
}