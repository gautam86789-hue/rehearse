import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  revenuecatWebhookSecret: process.env.REVENUECAT_WEBHOOK_SECRET || '',
  onesignalAppId: process.env.ONESIGNAL_APP_ID || '',
  posthogApiKey: process.env.POSTHOG_API_KEY || ''
};
