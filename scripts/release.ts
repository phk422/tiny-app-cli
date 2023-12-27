import process from 'node:process'
import { execSync } from 'node:child_process'

execSync(`bump ${process.env.ARG} --commit "chore: release v" --tag "v" --push`, { stdio: 'inherit' })
