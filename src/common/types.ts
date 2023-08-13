

export interface BlockRule {
  url: string
  methods: string[]
}

export interface PassRule {
  url: string
  methods: string[]
}

interface InjectStyleSettingEnable {
  enable: true
  url: string
  enabledCss: string
  disabledCss: string
}

interface InjectStyleSettingDisable {
  enable: false
}

export type InjectStyleSetting = InjectStyleSettingEnable | InjectStyleSettingDisable

export interface RuleSet {
  name: string
  blockRules: BlockRule[]
  passRules: PassRule[]
  injectStyle: InjectStyleSetting
}

export interface Settings {
  autoStart: boolean
  timeToReapplySeconds: number
  ruleSets: RuleSet[]
}
