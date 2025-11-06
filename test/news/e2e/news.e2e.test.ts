import puppeteer, { Browser, Page } from 'puppeteer'
import http from 'http'
import { AddressInfo } from 'net'
import { app } from '../../../src/index'

let server: http.Server
let browser: Browser
let page: Page
let baseUrl: string

beforeAll(async () => {
	server = app.listen(0)
	const addr = server.address() as AddressInfo
	const port = addr.port
	baseUrl = `http://127.0.0.1:${port}`

	browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	})
	page = await browser.newPage()
})

afterAll(async () => {
	if (browser) await browser.close()
	if (server) server.close()
})

describe('News E2E (Puppeteer)', () => {
	test('carga /news, muestra tarjetas y navega a detalle', async () => {
		await page.goto(`${baseUrl}/news`, { waitUntil: 'networkidle2' })

		// mostramos tarjetas de noticias
		await page.waitForSelector('.news-card', { timeout: 5000 })
		const cards = await page.$$('.news-card')
		expect(cards.length).toBeGreaterThan(0)

		// detalle de la primera noticia
		const firstTitle = await page.$eval('.news-card .news-title a', el => (el.textContent || '').trim())

		await Promise.all([
			page.waitForNavigation({ waitUntil: 'networkidle2' }),
			page.click('.news-card .news-title a')
		])

		await page.waitForSelector('.news-title', { timeout: 5000 })
		const detailTitle = await page.$eval('.news-title', el => (el.textContent || '').trim())

		expect(detailTitle).toBe(firstTitle)
	}, 20000)
})
