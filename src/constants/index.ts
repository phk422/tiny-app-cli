import type { Viewport } from 'puppeteer'

export const WEIXIN_URL = 'https://mp.weixin.qq.com/'

export enum PLATFORM {
  WEIXIN,
  ALIPAY,
}

export enum ACTION {
  REVIEW,
  RELEASE,
}

export const VIEWPORT: Viewport = { width: 1920, height: 1080, deviceScaleFactor: 1.5 }
