export interface Env {
  CACHE: KVNamespace;
  APP_NAME: string;
  ENVIRONMENT: string;
}

export interface CloudflareContext {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}
