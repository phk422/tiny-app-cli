import { yellow } from 'kolorist'
import type { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import type { Ora } from 'ora'
import ora from 'ora'
import { ACTION, VIEWPORT, WEIXIN_URL } from '../constants'
import { pathResolve, showQrCodeToTerminal, sleep } from '../utils'

let browser: Browser
let page: Page

let spinner: Ora

/**
 * 获取微信图片二维码
 */
export async function getLoginScanCode() {
  spinner = ora('正在获取登录二维码...').start()
  browser = await puppeteer.launch({ headless: false })
  page = await browser.newPage()
  await page.setViewport(VIEWPORT)
  await page.goto(WEIXIN_URL)
  const imgSelector = '.login_frame.input_login'
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
  await sleep(1000)
  await loginCode?.screenshot({ path: loginCodeImagePath, type: 'png' })
  const scanCode = await showQrCodeToTerminal(loginCodeImagePath)
  spinner.succeed(yellow('请使用微信扫描二维码登录微信公众平台'))
  console.log(scanCode)
  await page.waitForSelector('.weui-desktop-icon.weui-desktop-icon__success.weui-desktop-icon__large', { timeout: 0 })
  spinner.succeed('扫码成功')
}

/**
 * 跳转到版本列表
 */
export async function jumpToVersions() {
  spinner.start('正在跳转到版本管理页面...')
  const versionManage = await page.waitForSelector('.menu_item .tab-bar__wrap.tab-bar__wrap--submenu', { timeout: 0 })
  if (!versionManage) {
    spinner.fail('未找到版本管理')
    throw new Error('未找到版本管理')
  }
  spinner.start('正在跳转到版本管理页面...')
  await versionManage.click()
  const submitReviewBtn = await page.waitForSelector('.mod_default_box.code_version_dev .weui-desktop-btn.weui-desktop-btn_primary')
  if (!submitReviewBtn) {
    spinner.fail('未找到提交审核按钮')
    throw new Error('未找到提交审核按钮')
  }
  await submitReviewBtn.click()
  await sleep(1000)
}

/**
 * 跳转确认提交审核界面
 */
export async function jumpToConfirmPage() {
  spinner.start('正在提交审核中...')
  const agreeCheckbox = await page.waitForSelector('.weui-desktop-icon-checkbox')
  const nextStepBtn = await page.waitForSelector('.code_submit_dialog .weui-desktop-btn.weui-desktop-btn_primary')
  if (!agreeCheckbox || !nextStepBtn)
    throw new Error('未找阅读并了解平台审核规则')
  await agreeCheckbox.click()
  await nextStepBtn.click()

  // 代码审核进行安全测试提醒, 操作继续提交
  await page.evaluate(() => {
    const dialogs = [...document.querySelectorAll('.weui-desktop-dialog')].reverse()
    for (const dialog of dialogs) {
      if (dialog.querySelector('h4')?.textContent === '代码审核进行安全测试提醒') {
        dialog.querySelector<HTMLButtonElement>('.weui-desktop-btn_primary')?.click()
        break
      }
    }
  })
  // 检查是否有两小时急速审核 TODO

  // 关闭当前页面
  await sleep(1000)
  await page.close()
  await sleep(1000)
  // 切换提交审核页面
  const pages = await browser.pages()
  let flag = false
  for (const item of pages) {
    if (item.url().includes('wxamp/wadevelopcode/get_class')) {
      page = item
      flag = true
      break
    }
  }
  void page.setViewport(VIEWPORT)
  if (!flag)
    throw new Error('获取提交审核页面失败')
}

/**
 * 去提交审核
 */
export async function toSubmitAudit() {
  const submitBtn = await page.waitForSelector('.btn_primary')
  await sleep(200)
  if (!submitBtn)
    throw new Error('获取提交审核失败')
  await submitBtn.click()
  await page.waitForSelector('.msg_icon_wrp .icon_msg.success')
  const msg = await page.evaluate(() => {
    return document.querySelector('.msg_content')?.innerHTML
  })
  if (msg?.includes('已提交审核'))
    spinner.succeed('提交审核成功')
  else
    throw new Error('提交审核失败')
}

/**
 * 去发布
 */
export async function toRelease() {
  console.log('正在开发中...')
}

export default async function weixinRobot(action: ACTION) {
  await getLoginScanCode()
  await jumpToVersions()
  if (action === ACTION.REVIEW) {
    await jumpToConfirmPage()
    await toSubmitAudit()
  }
  else {
    await toRelease()
  }
}
