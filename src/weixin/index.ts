import { green } from 'kolorist'
import puppeteer from 'puppeteer'
import { WEIXIN_URL } from '../constants'
import { pathResolve, showQrCodeToTerminal } from '../utils'

export async function getLoginScanCode() {
  console.log(green('正在获取登录二维码...'))
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1.5 })
  await page.goto(WEIXIN_URL)
  const imgSelector = '.login__type__container__scan__qrcode'
  const loginCode = await page.waitForSelector(imgSelector)
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const el = document.querySelector<HTMLImageElement>('.login__type__container__scan__qrcode')
      if (el) {
        el.onload = resolve
        el.onerror = reject
      }
      else {
        reject(new Error('登录失败'))
      }
    })
  })
  const loginCodeImagePath = pathResolve('../template/login-qr.png')
  await loginCode?.screenshot({ path: loginCodeImagePath, type: 'png' })
  const scanCode = await showQrCodeToTerminal(loginCodeImagePath)
  // 打印二维码
  console.log(scanCode)
}
