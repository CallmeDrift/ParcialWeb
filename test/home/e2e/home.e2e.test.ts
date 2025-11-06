import puppeteer, { Browser } from 'puppeteer'
import { app } from '../../../src/index'
import { AddressInfo } from 'net'
import http from 'http'

let server: http.Server
let browser: Browser

describe('Home E2E', () => {
	beforeAll(async () => {
		// Levanta la app en un puerto libre
		server = app.listen(0)
		browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
	}, 30000)

	afterAll(async () => {
		if (browser) await browser.close()
		if (server && server.close) server.close()
	})

	test('muestra las últimas 3 noticias en el carousel', async () => {
		const port = (server.address() as AddressInfo).port
		const page = await browser.newPage()
		// usar domcontentloaded para evitar esperas largas por recursos multimedia
		await page.goto(`http://localhost:${port}/`, { waitUntil: 'domcontentloaded' })

		await page.waitForSelector('.carousel-item')
		const count = await page.$$eval('.carousel-item', (els: Element[]) => els.length)
		// HomeRouter envía las últimas 3 noticias
		expect(count).toBe(3)

		const firstTitle = await page.$eval('.carousel-item .news-title', (el: Element) => el.textContent?.trim())
		expect(typeof firstTitle).toBe('string')
		expect((firstTitle || '').length).toBeGreaterThan(0)

		await page.close()
		}, 45000)
})

