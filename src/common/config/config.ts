import dotenv from 'dotenv';
import { ENV } from '@/common/interfaces/env';
dotenv.config();
class ConfigService {
  getEnv(key: keyof ENV): string {
    if (!process.env[key]) {
      throw new Error(key + ' environment variable does not set');
    }
    return process.env[key]!;
  }

  get isProduction(): boolean {
    return this.getEnv('NODE_ENV') === 'production';
  }
  get isDevelopment(): boolean {
    return this.getEnv('NODE_ENV') === 'development';
  }
  get contextPath(): string {
    return this.getEnv('CONTEXT_PATH');
  }

  get portServer(): number {
    return Number.parseInt(this.getEnv('PORT'));
  }

  get hostServer(): string {
    return this.getEnv('HOST');
  }
  get JWTKey(): string {
    return this.getEnv('JWT_KEY');
  }
  get JWTRefreshKey(): string {
    return this.getEnv('JWT_REFRESH_KEY');
  }

  get mailAccount(): string {
    return this.getEnv('MAIL_ACCOUNT');
  }

  get mailAppPassword(): string {
    return this.getEnv('MAIL_APP_PASSWORD');
  }
  get verifyReturnUrl(): string {
    return this.getEnv('VERIFY_RETURN_URL');
  }

  get verifyExpiredUrl(): string {
    return this.getEnv('VERIFY_EXPIRED_URL');
  }

  get forgotPasswordReturnUrl(): string {
    return this.getEnv('FORGOT_PASSWORD_RETURN_URL');
  }


  get mongoUrl(): string {
    return this.getEnv('MONGO_URL');
  }

  get apiUrl(): string {
    return this.getEnv('API_URL');
  }
  
  get stripeSecret(): string {
    return this.getEnv('STRIPE_SECRET');
  }
  get pointSecret(): string {
    return this.getEnv('ENDPOINT_SECRET');
  }

  get striptAccountReturnUrl(): string {
    return this.getEnv('STRIPE_ACCOUNT_RETURN_URL');
  }

  get deepSeekApiKey(): string {
    return this.getEnv('DEEP_SEEK_API_KEY');
  }
  
  
  get grokApiKey(): string {
    return this.getEnv('GROK_API_KEY');
  }

}
const config = new ConfigService();
export default config;
