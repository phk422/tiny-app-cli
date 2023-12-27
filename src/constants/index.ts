import type { Viewport } from 'puppeteer'

export { description, version, name } from '../../package.json'

export const WEIXIN_URL = 'https://mp.weixin.qq.com/'

export enum PLATFORM {
  WEIXIN = 'weixin',
  ALIPAY = 'alipay',
}

export enum ACTION {
  REVIEW = 'review',
  RELEASE = 'release',
}

export const VIEWPORT: Viewport = { width: 1920, height: 1080, deviceScaleFactor: 1.5 }
