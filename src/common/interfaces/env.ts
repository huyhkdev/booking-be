export interface ENV {
  HOST: string | undefined;
  PORT: number | undefined;
  NODE_ENV: string | undefined;
  CONTEXT_PATH: string | undefined;
  JWT_KEY: string | undefined;
  MONGO_URL: string | undefined;
  DB_HOST: string | undefined;
  DB_PORT: string | undefined;
  DB_USERNAME: string | undefined;
  DB_PASSWORD: string | undefined;
  JWT_SECRET_KEY: string | undefined;
  JWT_REFRESH_KEY: string | undefined;
  MAIL_ACCOUNT: string | undefined;
  MAIL_APP_PASSWORD: string | undefined;
  VERIFY_RETURN_URL: string | undefined;
  VERIFY_EXPIRED_URL: string | undefined;
  FORGOT_PASSWORD_RETURN_URL: string | undefined;
  STRIPE_SECRET: string | undefined;
  ENDPOINT_SECRET: string | undefined;
  API_URL: string | undefined;
  STRIPE_ACCOUNT_RETURN_URL: string | undefined;
  DEEP_SEEK_API_KEY: string | undefined;
  GROK_API_KEY: string | undefined;

}
