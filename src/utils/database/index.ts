import { createConnection } from "typeorm";
import TypeormEntities from "./models";
import { env } from "@utils/constants";

export const setupDatabase = (): void => {
  createConnection({
    type: "mysql",
    host: env.DATABASE_INFO.HOST,
    database: env.DATABASE_INFO.DATABASE,
    username: env.DATABASE_INFO.USERNAME,
    password: env.DATABASE_INFO.PASSWORD,
    synchronize: true,
    entities: TypeormEntities
  }).then(_ => console.log("Connected to database!")).catch(console.error);
};