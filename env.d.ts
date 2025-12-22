interface ImportMetaEnv {
  readonly PROD?: boolean
  [key: string]: unknown
}

interface ImportMeta {
  readonly env?: ImportMetaEnv
}
