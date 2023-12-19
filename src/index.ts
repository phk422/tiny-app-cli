import { bgGreen, red, reset } from 'kolorist'
import prompts from 'prompts'
import { ACTION, PLATFORM } from './constants'
import weixinRobot from './weixin'

async function main() {
  const result: prompts.Answers<
  'platform' | 'action'
> = await prompts(
  [
    {
      type: 'select',
      message: reset('请选择登录方式'),
      name: 'platform',
      choices: [
        { title: '微信', description: '登录微信公众平台', value: PLATFORM.WEIXIN },
        { title: '支付宝', description: '登录支付宝公众平台', value: PLATFORM.ALIPAY },
      ],
      initial: 0,
    },
    {
      type: 'select',
      message: reset('您是提交审核还是发布？'),
      name: 'action',
      choices: [
        { title: '提审', description: '', value: ACTION.REVIEW },
        { title: '发布', description: '', value: ACTION.RELEASE },
      ],
      initial: 0,
    },
  ],
  {
    onCancel: () => {
      throw new Error(`${red('✖')} Operation cancelled`)
    },
  },
)

  console.log(result)
  if (result.platform === PLATFORM.WEIXIN)
    await weixinRobot()
  else
    console.log(bgGreen('正在开发中...'))
}

main().catch((err) => {
  console.error(err)
})
