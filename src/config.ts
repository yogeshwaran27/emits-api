import * as dotenv from 'dotenv';
dotenv.config();

const configurations =  {
    APP_PORT:process.env.APP_PORT,
    DB_USER:process.env.DB_USER,
    DB_PASSWORD:process.env.DB_PASSWORD,
    FRONTEND_REDIRECT:process.env.FRONTEND_REDIRECT,
    NODE_ENV:process.env.ENV,
    DB_NAME:process.env.DB_NAME,
    DB_HOST:process.env.DB_HOST,
    DB_PORT:process.env.DB_PORT,
    JWT_CONSTANT:process.env.JWT_CONSTANT,
    FRONTEND_URL:process.env.FRONTEND_URL,
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET,
    CLIENT_USER_NAME:process.env.CLIENT_USER_NAME
  };

export default configurations;