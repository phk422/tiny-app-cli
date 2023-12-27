# 🚀 tiny-app-cli
自动提审与发布微信、支付宝小程序

## 安装
With NPM:
```bash
npm install -g tiny-app-cli
```

With PNPM:
```bash
pnpm install -g tiny-app-cli
```

With Yarn:
```bash
yarn add -g tiny-app-cli
```

## 如何使用？
```bash
tiny-app-cli
```
然后按照提示去做!

## 命令行参数
```bash
$ tiny-app-cli -h
Usage: tiny-app-cli [options]

自动提审与发布微信、支付宝小程序, 更好的实现小程序的CI/CD

Options:
  -V, --version              output the version number
  -p, --platform <platform>  操作的平台 (choices: "weixin", "alipay")
  -a, --action <action>      提审或者发布 (choices: "review", "release")
  -h, --help                 display help for command
```

示例
```bash
# 微信小程序提审
tiny-app-cli -p weixin -a review

# 微信小程序发布
tiny-app-cli -p weixin -a release
```

## 注意事项
- 由于当前功能不完善，在微信小程序提审的过程中，请确保你已经提审过一次小程序

## 更多功能正在设计中...

## 其他
如果有任何问题，欢迎提 [issue](https://github.com/phk422/tiny-app-cli/issues) 或者 [PR](https://github.com/phk422/tiny-app-cli/pulls)!
