import path from 'node:path'
import fs from 'node:fs'
import qrcodeTerminal from 'qrcode-terminal'
import jsqr from 'jsqr'
import UPNG from '@pdf-lib/upng'

/**
 * 获取文件路径
 * @param paths
 * @returns 文件路径
 */
export function pathResolve(...paths: string[]) {
  return path.resolve(__dirname, ...paths)
}

/**
 * 打印二维码到终端
 * @param targetPath 目标路径
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
