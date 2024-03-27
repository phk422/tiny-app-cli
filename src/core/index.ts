import { bgGreen, blue, green, red, reset } from 'kolorist'
import prompts from 'prompts'
import { ACTION, PLATFORM } from '../constants'
import weixinRobot from '../weixin'
import { isEmpty, onCancel } from '../utils'

export default async function main(options: InputOptions) {
  const result: prompts.Answers<
  'platform' | 'action'
> = await prompts(
  [
    {
      type: isEmpty(options.platform) ? 'select' : null,
      message: reset('请选择发布平台'),
      name: 'platform',
      choices: [
        { title: green('微信'), description: '登录微信公众平台', value: PLATFORM.WEIXIN },
        { title: blue('支付宝'), description: '登录支付宝公众平台', value: PLATFORM.ALIPAY },
      ],
      initial: 0,
    },
    {
      type: isEmpty(options.action) ? 'select' : null,
      message: reset('您是提交审核还是发布？'),
      name: 'action',
      choices: [
        { title: '提审', description: '提审小程序', value: ACTION.REVIEW },
        { title: red('发布'), description: '发布小程序', value: ACTION.RELEASE },
      ],
      initial: 0,
    },
  ],
  {
    onCancel,
  },
)
  const opts = {
    ...options,
    ...result,
  }
  if (opts.platform === PLATFORM.WEIXIN)
    await weixinRobot(opts)
  else
    console.log(bgGreen('正在开发中...'))
}
