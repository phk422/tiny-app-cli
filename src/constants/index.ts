import process from 'node:process'
import type { Viewport } from 'puppeteer'

export { description, version, name } from '../../package.json'

export const WEIXIN_URL = 'https://mp.weixin.qq.com/'
export const ALIPAY_URL = 'https://auth.alipay.com/login/ant_sso_index.htm?goto=https%3A%2F%2Fopen.alipay.com%2Fdevelop%2Fmanage'

export enum PLATFORM {
  WEIXIN = 'weixin',
  ALIPAY = 'alipay',
}

export enum ACTION {
  REVIEW = 'review',
  RELEASE = 'release',
}

export const VIEWPORT: Viewport = { width: 1920, height: 1080, deviceScaleFactor: 1.5 }

export const __DEV__ = process.env.NODE_ENV === 'development'
