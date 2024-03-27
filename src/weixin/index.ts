import process from 'node:process'
import { yellow } from 'kolorist'
import type { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import type { Ora } from 'ora'
import ora from 'ora'
import prompts from 'prompts'
import { ACTION, VIEWPORT, WEIXIN_URL, __DEV__ } from '../constants'
import { onCancel, pathResolve, showQrCodeToTerminal, sleep } from '../utils'

let browser: Browser
let page: Page

let spinner: Ora
let options: InputOptions

/**
 * 获取微信图片二维码
 */
export async function getLoginScanCode(opts: InputOptions = options) {
  spinner = ora('正在获取登录二维码...').start()
  browser = await puppeteer.launch({ headless: __DEV__ ? false : opts.headless })
  page = await browser.newPage()
  await page.setViewport(VIEWPORT)
  await page.goto(WEIXIN_URL)
  const imgSelector = '.login_frame.input_login'
  const loginCode = await page.waitForSelector(imgSelector)
  await page.evaluate(() => {
    return new Promise<void>((resolve, reject) => {
      const el = document.querySelector<HTMLImageElement>('.login__type__container__scan__qrcode')
      if (el) {
        el.onload = () => resolve()
        el.onerror = reject
      }
      else {
        reject(new Error('登录失败'))
      }
    })
  })
  const loginCodeImagePath = pathResolve('../cache/login-qr.png')
  const getScanCode = async (): Promise<string> => {
    await loginCode?.screenshot({ path: loginCodeImagePath, type: 'png' })
    try {
      return await showQrCodeToTerminal(loginCodeImagePath)
    }
    catch (e) {
      await sleep()
      return getScanCode()
    }
  }
  const scanCode = await getScanCode()
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
  const token = new URL(page.url()).searchParams.get('token')
  await page.goto(`https://mp.weixin.qq.com/wxamp/wacodepage/getcodepage?token=${token}&lang=zh_CN`)
}

/**
 * 跳转确认提交审核界面
 */
export async function jumpToConfirmPage() {
  const submitReviewBtnSelector = '.mod_default_box.code_version_dev .weui-desktop-btn.weui-desktop-btn_primary'
  let submitReviewBtn = await page.waitForSelector(submitReviewBtnSelector)
  if (!submitReviewBtn) {
    spinner.fail('未找到提交审核按钮')
    throw new Error('未找到提交审核按钮')
  }
  const isSubmitReviewBtnDisabled = await submitReviewBtn.evaluate(btn => btn.classList.contains('weui-desktop-btn_disabled'))
  // 判断是否有提交审核中的版本
  const testVersion = await page.$('.mod_default_bd.default_box.test_version')
  if (testVersion && !await testVersion.evaluate(el => el.textContent?.includes('你暂无提交审核的版本或者版本已发布上线'))) {
    if (!options.forceSubmit) {
      spinner.stop()
      const result: prompts.Answers<'forceSubmit'> = await prompts([
        {
          type: 'confirm',
          name: 'forceSubmit',
          message: '当前已存在版本，是否继续强制提交审核？',
          initial: false,
        },
      ], {
        onCancel,
      })
      if (!result.forceSubmit)
        throw new Error('退出提审')
      else
        spinner.start()
    }
  }
  if (isSubmitReviewBtnDisabled) {
    // 撤回
    await page.evaluate(() => {
      const el: HTMLButtonElement | null = document.querySelector('.mod_default_bd.default_box.test_version .weui-desktop-dropdown__list-ele__text')
      el!.click()
    })
    await sleep()
    const confirm = await page.$('body > div:nth-child(9) > div.weui-desktop-dialog__wrp.self-weui-modal > div > div.weui-desktop-dialog__ft > div > div:nth-child(2) > button')
    await confirm?.click()
    await sleep(2000)
    submitReviewBtn = await page.waitForSelector(submitReviewBtnSelector)
  }
  await submitReviewBtn!.click()
  await sleep(1200) // 可能会报错
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
  const statusEle = await page.waitForSelector('#js_container_box > div.col_main > div > div:nth-child(2) > div.main_bd > span > div.code_mod.mod_default_box.code_version_test > div.mod_default_bd.default_box.test_version > div > div > div.code_version_log_hd > div > div > span > p > span')
  // 检查审核状态
  const statusText = await page.evaluate((el) => {
    return el?.innerHTML
  }, statusEle)
  if (statusText !== '审核通过待发布') {
    spinner.fail(statusText)
    throw new Error(statusText)
  }
  const submitBtn = await page.waitForSelector('#js_container_box > div.col_main > div > div:nth-child(2) > div.main_bd > span > div.code_mod.mod_default_box.code_version_test > div.mod_default_bd.default_box.test_version > div > div > div.code_version_log_ft > div > div.weui-desktop-popover__wrp > span > div > button')
  // 点击提交审核
  await submitBtn?.click()
  const submitConfirm = await page.waitForSelector('#js_container_box > div.col_main > div > div:nth-child(2) > div:nth-child(9) > div.weui-desktop-dialog__wrp.self-weui-modal > div > div.weui-desktop-dialog__ft > div > div:nth-child(1) > button')
  await submitConfirm?.click()

  const releaseCodeImagePath = pathResolve('../cache/release.png')
  const codeEle = await page.waitForSelector('#js_container_box > div.col_main > div > div:nth-child(2) > div.qrcheck_dialog_simple > div.weui-desktop-dialog__wrp.self-weui-modal > div > div.weui-desktop-dialog__bd > div > div > div > div.weui-desktop-qrcheck__qrcode-area > div > img')
  await page.evaluate((el) => {
    return new Promise((resolve, reject) => {
      if (el) {
        el.onload = resolve
        el.onerror = reject
      }
      else {
        reject(new Error('获取发布二维码失败'))
      }
    })
  }, codeEle)
  await codeEle?.screenshot({ path: releaseCodeImagePath, type: 'png' })
  spinner.clear()
  console.clear()
  spinner.succeed(yellow('请使用微信扫描二维码发布'))
  console.log(await showQrCodeToTerminal(releaseCodeImagePath))
  const result = await page.waitForSelector('#js_container_box > div.col_main > div > div:nth-child(2) > div.main_bd > span > div.code_mod.mod_default_box.code_version_test > div.mod_default_bd.default_box.test_version > div > div > p')
  if (result)
    spinner.succeed('发布成功')
}

export default async function weixinRobot(opts: InputOptions) {
  options = opts
  try {
    await getLoginScanCode()
    await jumpToVersions()
    if (options.action === ACTION.REVIEW) {
      await jumpToConfirmPage()
      await toSubmitAudit()
    }
    else {
      await toRelease()
    }
    process.exit(0)
  }
  catch (err) {
    if (__DEV__) {
      console.error(err)
      return
    }
    process.exit(1)
  }
}
