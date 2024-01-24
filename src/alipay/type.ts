export interface IBrand {
  hasAlipayOnline: boolean
  showIteration: boolean
  gmtCreate: number
  gmtModified: number
  appId: string
  appName: string
  appDesc: string
  appType: string
  logoUrl: string
  oid: string
  pid: string
  status: string
  masterName: string
  masterAccount: string
  lastVersion?: string
  lastVersionStatus?: string
  allowBind: boolean
  bindStatus: string
  currentRole: {
    [index: string]: string
  }
}
