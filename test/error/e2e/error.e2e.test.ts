import puppeteer, { Browser } from 'puppeteer'
import { app } from '../../../src/index'
import { AddressInfo } from 'net'
import http from 'http'

let server: http.Server
let browser: Browser

describe('Error E2E', () => {
  beforeAll(async () => {
    // Levantamos la app en un puerto libre
    server = app.listen(0)
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  }, 30000)

  afterAll(async () => {
    if (browser) await browser.close()
    if (server && server.close) server.close()
  })

  test('ruta de error renderiza plantilla y responde 404', async () => {
    const port = (server.address() as AddressInfo).port
    const page = await browser.newPage()

    // montamos ErrorRouter en '/{*any}'
    const url = `http://localhost:${port}/{*any}`
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' })

    // Comprobamos status 404
    expect(response?.status()).toBe(404)

    // Comprobamos que se muestre la ejs
    await page.waitForSelector('.error-title')
    const title = await page.$eval('.error-title', (el: Element) => el.textContent?.trim())
    expect(title).toBe('Error 404')

    const message = await page.$eval('.error-message', (el: Element) => el.textContent?.trim())
    expect(message).toMatch(/no existe/i)

    await page.close()
  }, 30000)
})
