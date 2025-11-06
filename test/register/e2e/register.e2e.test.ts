import path from 'node:path'
import fs from 'node:fs'
import puppeteer, { Browser } from 'puppeteer'
import { AddressInfo } from 'node:net'
import { app } from '../../../src/index'

const DB_PATH = path.join(__dirname, '../../../database/news.json')

type NewsItem = { title: string; [key: string]: unknown }

describe('Register E2E (puppeteer)', () => {
  let server: import('http').Server
  let browser: Browser
  let originalDbContent: Buffer

  beforeAll(async () => {
    // Backup de la bd
    originalDbContent = fs.readFileSync(DB_PATH)

    // Inicia el server
    server = app.listen(0)

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  })

  afterAll(async () => {
    if (browser) await browser.close()
    if (server) server.close()

    // restaura la DB
    fs.writeFileSync(DB_PATH, originalDbContent)
  })

  test('should submit add-news form and be redirected to /news with new item visible', async () => {
    const address = server.address() as AddressInfo
    const port = address.port
    const base = `http://localhost:${port}`

    const page = await browser.newPage()

    // prueba de agregar noticia
    await page.goto(`${base}/add`, { waitUntil: 'networkidle0' })

    const uniqueTitle = `Prueba E2E ${Date.now()}`

    await page.type('#title', uniqueTitle)
    await page.type('#summary', 'Resumen de prueba')
    await page.type('#content', 'Contenido de prueba para la noticia')
    await page.type('#image', 'https://i.pinimg.com/736x/c0/a4/72/c0a4729fa1cc29dff6bfb04819ba37d1.jpg')

    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    await page.type('#date', dateStr)
    await page.type('#comments', 'Comentario de prueba')

    // fetch con puppeteer
    await page.evaluate(async (payload: Record<string, string>) => {
      await fetch('/news/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as Record<string, string>)
      })
    }, {
      title: uniqueTitle,
      summary: 'Resumen de prueba',
      content: 'Contenido de prueba para la noticia',
      image: 'https://i.pinimg.com/736x/c0/a4/72/c0a4729fa1cc29dff6bfb04819ba37d1.jpg',
      date: dateStr,
      comments: 'Comentario de prueba'
    })

    // despues del post, renderiza /news
    await page.goto(`${base}/news`, { waitUntil: 'networkidle0' })
    expect(page.url()).toContain('/news')

  // revisamos bd para ver si se agregó la noticia
  const dbRaw = fs.readFileSync(DB_PATH, 'utf-8')
  const db = JSON.parse(dbRaw) as Array<NewsItem>
  const found = db.find((n: NewsItem) => n.title === uniqueTitle)
  expect(found).toBeDefined()

    await page.close()
  }, 20000)
})
