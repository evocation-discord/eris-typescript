import { createConnection } from "typeorm";
import TypeormEntities from "./models";
import { DATABASE_INFO } from "../constants";

export const setupDatabase = (): void => {
  createConnection({
    type: "mysql",
    host: DATABASE_INFO.HOST,
    database: DATABASE_INFO.DATABASE,
    username: DATABASE_INFO.USERNAME,
    password: DATABASE_INFO.PASSWORD,
    synchronize: true,
    entities: TypeormEntities
  }).then(_ => console.log("Connected to database!")).catch(console.error);
};