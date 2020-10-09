import { createClient, ClientOpts, RedisClient } from "redis";
import Redis from "ioredis";
import { promisify } from "util";
import { P, PV } from "..";

// Defines the promise Redis client.
class PromiseRedisClient {
  public baseClient: RedisClient;
  public get: (key: string) => P<string>;
  public set: (key: string, value: string) => PV<void>;
  public sadd: (key: string, value: string[]) => PV<void>;
  public smembers: (key: string) => P<string[]>;
  public srem: (key: string, value: string) => PV<void>;
  public ping: () => P<string>;
  public ttl: (key: string) => P<number>;
  public del: (key: string) => P<number>;

  constructor(options?: ClientOpts) {
    this.baseClient = createClient(options);
    this.get = promisify(this.baseClient.get).bind(this.baseClient);
    this.set = promisify(this.baseClient.set).bind(this.baseClient);
    this.sadd = promisify(this.baseClient.sadd).bind(this.baseClient);
    this.smembers = promisify(this.baseClient.smembers).bind(this.baseClient);
    this.srem = promisify(this.baseClient.srem).bind(this.baseClient);
    this.ping = promisify(this.baseClient.ping).bind(this.baseClient);
    this.ttl = promisify(this.baseClient.ttl).bind(this.baseClient);
    this.del = promisify(this.baseClient.del).bind(this.baseClient);
  }
}

// Return the Redis client.
// export default new PromiseRedisClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
//   password: process.env.REDIS_PASSWORD,
// });

export default new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
  password: process.env.REDIS_PASSWORD,
});