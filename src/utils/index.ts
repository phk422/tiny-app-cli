import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import qrcodeTerminal from 'qrcode-terminal'
import jsqr from 'jsqr'
import UPNG from '@pdf-lib/upng'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 将传入的路径组合起来形成一个完整的路径
 * @param {...string} paths - 要组合的路径
 * @returns {string} - 完整的路径
 */
export function pathResolve(...paths: string[]) {
  return path.resolve(__dirname, ...paths)
}

/**
 * 显示QR码到终端
 * @param targetPath - 目标路径
 * @returns 返回一个Promise，resolve时为生成的QR码对象，reject时为Error对象
 */
export async function showQrCodeToTerminal(targetPath: string) {
  return new Promise((resolve, reject) => {
    const data = UPNG.decode(fs.readFileSync(targetPath))
    const code = jsqr(new Uint8ClampedArray(UPNG.toRGBA8(data)[0]), data.width, data.height)
    if (code) {
      qrcodeTerminal.generate(code.data, { small: true }, (qrcode) => {
        resolve(qrcode)
      })
    }
    else {
      reject(new Error('QR code not found'))
    }
  })
}

/**
 * 等待指定的时间后返回Promise
 * @param {number} ms - 要等待的时间，以毫秒为单位
 * @returns {Promise} - 等待指定时间后返回的Promise对象
 */
export function sleep(ms: number = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
