import path from 'node:path'
import fs from 'node:fs'
import News from '../../news/types/News'

export default class RegisterModel {
    private readonly filePath: string

    constructor() {
        this.filePath = path.join(__dirname, '../../../database/news.json')
    }

    saveNews(newsData: Omit<News, "id">): void {
        const data = fs.readFileSync(this.filePath, "utf-8")
        const newsList = JSON.parse(data) as News[]

        const last = newsList[newsList.length - 1]
        const newId = last ? last.id + 1 : 1

        const newNews: News = {
            id: newId,
            ...newsData
        }

        newsList.push(newNews)
        fs.writeFileSync(this.filePath, JSON.stringify(newsList, null, 2))
    }
}

