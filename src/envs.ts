import dotenv from "dotenv";

dotenv.config();

let env = process.env;
let value = {
  "1point3acres": {
    authorization: env.ONEPOINTTHREEACRES_AUTHORIZATION,
  },
  leetcode: {
    telegram_chat_id: env.LEETCODE_TELEGRAM_CHAT_ID,
  },
  telegram: {
    bot_token: env.TELEGRAM_BOT_TOKEN,
  },
  telegraph: {
    access_token: env.TELEGRAPH_ACCESS_TOKEN,
  },
  cloudconvert: {
    api_key: env.CLOUDCONVERT_API_KEY,
  },
  google: {
    account: env.GOOGLE_ACCOUNT,
    app_password: env.GOOGLE_APP_PASSWORD,
  },
  mongodb: {
    uri: env.MONGODB_URI,
  },
  redis: {
    url: env.REDIS_URL,
  },
  rss: {
    url: env.RSS_URL,
  },
  email: {
    smtp_host: env.EMAIL_SMTP_HOST,
    smtp_port: env.EMAIL_SMTP_PORT,
    smtp_secure: env.EMAIL_SMTP_SECURE,
    smtp_user: env.EMAIL_SMTP_USER,
    smtp_pass: env.EMAIL_SMTP_PASS,
    mail_from: env.EMAIL_MAIL_FROM,
    mail_to: env.EMAIL_MAIL_TO,
    max_attach_mb: env.EMAIL_MAX_ATTACH_MB,
  },
};

const envs = {
  set: (newEnvs: { [key: string]: any }): void => {
    Object.assign(value, newEnvs);
  },
  get value(): { [key: string]: any } {
    return value;
  },
};

export default envs;