/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
  readonly VITE_ENABLE_LOGS: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
