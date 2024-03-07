/* eslint-disable ts/no-unsafe-assignment */
/* eslint-disable ts/no-unsafe-member-access */

import { yellow } from 'kolorist'
import type { Browser, ElementHandle, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import type { Ora } from 'ora'
import ora from 'ora'
import prompts from 'prompts'
import { ALIPAY_URL, VIEWPORT, __DEV__ } from '../constants'
import { pathResolve, showQrCodeToTerminal } from '../utils'
import type { IBrand } from './type'

let browser: Browser
let page: Page

let spinner: Ora
let options: InputOptions

async function getLoginScanCode() {
  spinner = ora('正在获取登录二维码...').start()
  browser = await puppeteer.launch({ headless: __DEV__ ? false : options.headless })
  page = await browser.newPage()
  await page.setViewport(VIEWPORT)
  await page.goto(ALIPAY_URL)
  const qrWrapper = await page.waitForSelector('.authcenter-body-login')
  const qrCodePath = pathResolve('../cache/login-qr-alipay.png')
  await qrWrapper?.screenshot({ path: qrCodePath })
  spinner.succeed(yellow('请使用支付宝扫描二维码登录'))
  console.log(await showQrCodeToTerminal(qrCodePath))
  await page.waitForSelector('.title___UNcmz')
  spinner.succeed('支付宝登录成功')
}

async function getBrandList(): Promise<IBrand[]> {
  const brandList: IBrand[] = []
  let nextBtn: ElementHandle | null = null
  spinner.start('获取品牌列表')
  return new Promise((resolve) => {
    // eslint-disable-next-line ts/no-misused-promises
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('https://developerportal.alipay.com/app/appPageQuery.json') && url.includes('appType=TINYAPP_NORMAL')) {
        const result: any = await response.json()
        const list: IBrand[] = result.data.rows
        brandList.push(...list)
        if (result.data.pageInfo.pageNum * result.data.pageInfo.pageSize < result.data.pageInfo.total) {
          nextBtn = nextBtn ?? await page.waitForSelector('#rc-tabs-0-panel-TINYAPP_NORMAL > div > div.ant-table-wrapper > div > div > ul > li.ant-pagination-next > button')
          void nextBtn?.click()
        }
        else {
          page.off('response')
          resolve(brandList)
          spinner.succeed('获取品牌列表成功')
        }
      }
    })
  })
}

export async function alipayRobot(opts: InputOptions) {
  options = opts
  await getLoginScanCode()
  const brandList = await getBrandList()
  const result = await prompts({
    type: 'multiselect',
    name: 'brand',
    message: '请选择要登录的支付宝账号',
    choices: brandList.map((item) => {
      return {
        title: item.appName,
        value: item.appId,
        description: item.lastVersion,
      }
    }),
  })
  console.log(result)
}
