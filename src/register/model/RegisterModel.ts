import path from 'node:path'
import fs from 'node:fs'
import News from '../../news/types/News'

export default class RegisterModel {
    private readonly filePath: string

    constructor() {
        this.filePath = path.join(__dirname, '../../../database/news.json')
    }

    saveNews(newsData: Omit<News, 'id'>): void {

        const raw = fs.readFileSync(this.filePath, 'utf-8')
        const parsed = JSON.parse(raw) as News[] | undefined
        const newsList: News[] = Array.isArray(parsed) ? parsed : []

        const newId = newsList.reduce((maxId, item) => {
            return item && typeof item.id === 'number' ? Math.max(maxId, item.id) : maxId
        }, 0) + 1

        const newNews: News = { id: newId, ...newsData }

        newsList.push(newNews)
        fs.writeFileSync(this.filePath, JSON.stringify(newsList, null, 2), 'utf-8')
    }
}

