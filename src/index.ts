import { Option, program } from 'commander'
import { ACTION, BOOLEAN, PLATFORM, description, name, version } from './constants'
import main from './core'
import { handleOptions } from './utils'

program.name(name).version(version).description(description)
  .addOption(new Option('-p, --platform <platform>', '操作的平台').choices(Object.values(PLATFORM)))
  .addOption(new Option('-a, --action <action>', '提审或者发布').choices(Object.values(ACTION)))
  .addOption(new Option('-ie, --ignoreExisting [ignoreExisting]', '忽略审核中的版本').choices(Object.values(BOOLEAN)))
  .addOption(new Option('-hl, --headless [headless]', '浏览器无头模式').default('new').choices(['false', 'new']))

program.parse()

const options = handleOptions(program.opts<InputOptions>())

main(options).catch((err) => {
  console.error(err)
})
