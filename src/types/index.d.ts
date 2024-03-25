import type { PuppeteerLaunchOptions } from 'puppeteer'
import type { ACTION, PLATFORM } from '../constants'

declare global {
  interface InputOptions {
    platform: PLATFORM
    action: ACTION
    headless: PuppeteerLaunchOptions['headless']
    ignoreExisting: PuppeteerLaunchOptions['ignoreExisting']
  }
}
