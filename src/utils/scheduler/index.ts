import path from "path";
import { RedisClient } from "../client";

interface Event {
  timestamp: number,
  actionPath: string,
  args: unknown
}

class Scheduler {
  loadEvents() {
    const processor = this.processEvent.bind(this);
    RedisClient.smembers("events").then(scheduledItems => {
      for (const json of scheduledItems) {
        const event = JSON.parse(json) as Event;
        processor(event, json);
      }
    });
  }

  newEvent<T>(actionPath: string, seconds: number, args: T) {
    const timestamp = Math.round(Date.now() / 1000) + seconds;
    const event: Event = {
      actionPath, args, timestamp,
    };
    const json = JSON.stringify(event);
    RedisClient.sadd("events", [json]);
    this.processEvent(event, json);
  }

  private async runEvent(event: Event, json: string) {
    // require isn't too expensive here - it has a cache so it'll only block once per module.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(path.join(__dirname, event.actionPath)).default(event.args);

    // Delete the event.
    await RedisClient.srem("events", json);
  }

  private processEvent(event: Event, json: string) {
    const timestamp = Math.round(Date.now() / 1000);
    const runner = () => this.runEvent.bind(this)(event, json);
    if (timestamp >= event.timestamp) runner();
    else setTimeout(runner, (event.timestamp - timestamp) * 1000);
  }
}

export default new Scheduler();