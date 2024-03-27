import type { PuppeteerLaunchOptions } from 'puppeteer'
import type { ACTION, BOOL, PLATFORM } from '../constants'

declare global {
  interface InputOptions {
    platform: PLATFORM
    action: ACTION
    headless: PuppeteerLaunchOptions['headless']
    forceSubmit: BOOL
  }
}
