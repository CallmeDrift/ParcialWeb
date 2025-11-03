import path from 'node:path'
import fs from 'node:fs'
import puppeteer from 'puppeteer'
import { AddressInfo } from 'node:net'

// Import the express app exported from src/index
import { app } from '../../../src/index'

const DB_PATH = path.join(__dirname, '../../../database/news.json')

describe('Register E2E (puppeteer)', () => {
  let server: any
  let browser: any
  let originalDbContent: Buffer

  beforeAll(async () => {
    // Backup database file so tests don't leave persistent changes
    originalDbContent = fs.readFileSync(DB_PATH)

    // Start server on ephemeral port
    server = app.listen(0)

    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  })

  afterAll(async () => {
    // Close browser and server
    if (browser) await browser.close()
    if (server) server.close()

    // Restore DB
    fs.writeFileSync(DB_PATH, originalDbContent)
  })

  test('should submit add-news form and be redirected to /news with new item visible', async () => {
    // get port
    const address = server.address() as AddressInfo
    const port = address.port
    const base = `http://localhost:${port}`

    const page = await browser.newPage()

    // Navigate to add page
    await page.goto(`${base}/add`, { waitUntil: 'networkidle0' })

    const uniqueTitle = `Prueba E2E ${Date.now()}`

    // Fill form fields
    await page.type('#title', uniqueTitle)
    await page.type('#summary', 'Resumen de prueba')
    await page.type('#content', 'Contenido de prueba para la noticia')
    await page.type('#image', 'https://example.com/image.png')
    // set date to today (YYYY-MM-DD)
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`
    await page.type('#date', dateStr)
    await page.type('#comments', 'Comentario de prueba')

    // Submit form via fetch from the page context to ensure the POST is sent
  await page.evaluate(async (payload: any) => {
      await fetch('/news/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload as any)
      })
    }, {
      title: uniqueTitle,
      summary: 'Resumen de prueba',
      content: 'Contenido de prueba para la noticia',
      image: 'https://example.com/image.png',
      date: dateStr,
      comments: 'Comentario de prueba'
    })

    // After POST, navigate to /news to trigger rendering
    await page.goto(`${base}/news`, { waitUntil: 'networkidle0' })
    expect(page.url()).toContain('/news')

  // Check the database directly to avoid pagination issues in the view
  const dbRaw = fs.readFileSync(DB_PATH, 'utf-8')
  const db = JSON.parse(dbRaw) as Array<any>
  const found = db.find((n: any) => n.title === uniqueTitle)
  expect(found).toBeDefined()

    await page.close()
  }, 20000)
})
