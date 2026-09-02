/// <reference types="vite/client" />

declare module '#q-app' {
  export function defineRouter<T = any>(fn: () => T): T;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly QUASAR_SERVER?: boolean;
  readonly QUASAR_VUE_ROUTER_MODE?: string;
  readonly QUASAR_VUE_ROUTER_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    accept: (callback: () => void) => void;
  };
}
