import { cleanEnv, num } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(
  {
    PORT: process.env.PORT ?? 3000,
  },
  {
    PORT: num(),
  },
);
