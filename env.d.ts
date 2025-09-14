declare namespace NodeJS {
  interface ProcessEnv {
    JWT_ACCESS_TTL: string;
    JWT_REFRESH_TTL: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
  }
}
