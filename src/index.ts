import { Option, program } from 'commander'
import { ACTION, PLATFORM, description, name, version } from './constants'
import main from './core'
import { handleOptions } from './utils'

program.name(name).version(version).description(description)
  .addOption(new Option('-p, --platform <platform>', '操作的平台').choices(Object.values(PLATFORM)))
  .addOption(new Option('-a, --action <action>', '提审或者发布').choices(Object.values(ACTION)))
  .addOption(new Option('-f, --force-submit', '如果存在【审核中】或【审核通过】的版本，这将强制提交新的审核版本'))
  .addOption(new Option('-hl, --headless [headless]', '浏览器无头模式').default('new').choices(['false', 'new']))

program.parse()

const options = handleOptions(program.opts<InputOptions>())

main(options).catch((err) => {
  console.error(err)
})
