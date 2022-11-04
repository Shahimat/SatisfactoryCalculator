import { cleanEnv, num, str } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(
  {
    PORT: process.env.PORT ?? 3000,
    ASSETS_DIR_NAME: process.env.ASSETS_DIR_NAME ?? 'assets',
  },
  {
    PORT: num(),
    ASSETS_DIR_NAME: str(),
  },
);
