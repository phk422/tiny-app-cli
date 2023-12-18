import path from 'node:path'
import { green } from 'kolorist'
import puppeteer from 'puppeteer'
import { WEIXIN_URL } from '../constants'

export async function getLoginScanCode() {
  console.log(green('正在获取登录二维码...'))
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(WEIXIN_URL)
  const loginCode = await page.waitForSelector('.login__type__container__scan__qrcode')
  const loginCodeImagePath = path.resolve(__dirname, '../template/login.png')
  await loginCode?.screenshot({ path: loginCodeImagePath })
}
