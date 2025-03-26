import { DataSource } from 'typeorm';

const DB_HOST = process.env.DB_HOST || 'psfoqtuvxhmctfveouif.db.eu-central-1.nhost.run';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'a45GQNhZNyuXzcDf';
const DB_DATABASE = process.env.DB_DATABASE || 'psfoqtuvxhmctfveouif';

const connectionString = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

export const dataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // Never use this in production!
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  logging: true,
  migrationsRun: false,
  ssl: false, // Disable SSL for development
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  }
});

dataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
