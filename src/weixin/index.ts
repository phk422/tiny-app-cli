import { green } from 'kolorist'
import type { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import { WEIXIN_URL } from '../constants'
import { pathResolve, showQrCodeToTerminal } from '../utils'

let browser: Browser
let page: Page

/**
 * 获取微信图片二维码
 */
export async function getLoginScanCode() {
  console.log(green('正在获取登录二维码...'))
  browser = await puppeteer.launch({ headless: false })
  page = await browser.newPage()
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
  const loginCodeImagePath = pathResolve('../cache/login-qr.png')
  await loginCode?.screenshot({ path: loginCodeImagePath, type: 'png' })
  const scanCode = await showQrCodeToTerminal(loginCodeImagePath)
  console.log(green('☛ 请使用微信扫描二维码登录'))
  console.log(scanCode)
}

export async function jumpeToVersions() {
  const versionManage = await page.waitForSelector('.menu_item .tab-bar__wrap.tab-bar__wrap--submenu')
  console.log(green('登录成功'))
  if (!versionManage)
    throw new Error('未找到版本管理')
  console.log(green('正在跳转到版本管理页面...'))
  void versionManage.click()
  const subimitReviewBtn = await page.waitForSelector('.mod_default_box.code_version_dev .weui-desktop-btn.weui-desktop-btn_primary')
  if (!subimitReviewBtn)
    throw new Error('未找到提交审核按钮')
  void subimitReviewBtn.click()
}

export default async function weixinRobot() {
  await getLoginScanCode()
  await jumpeToVersions()
}
