import type { ACTION, PLATFORM } from '../constants'

declare global {
  interface InputOptions {
    platform: PLATFORM
    action: ACTION
  }
}
