import {
  RequestBlockService,
  RequestBlockServiceEvents,
} from "../interfaces/RequestBlockService";
import { Broadcaster } from "../interfaces/core";

export class RequestBlockServiceImpl implements RequestBlockService {
  private broadcaster: Broadcaster<RequestBlockServiceEvents>;
  constructor(broadcaster: Broadcaster<RequestBlockServiceEvents>) {
    this.broadcaster = broadcaster;
  }

  async enable(): Promise<void> {
    console.log("RequestBlockServiceImpl#enable()");
    this.broadcaster.broadcast("changeState", "enable");
  }
  async disable(): Promise<void> {
    console.log("RequestBlockServiceImpl#enable()");
    throw new Error("Method not implemented.");
  }
  async isEnabled(): Promise<boolean> {
    console.log("RequestBlockServiceImpl#isEnabled()");
    return true;
  }
  async update(): Promise<void> {
    console.log("RequestBlockServiceImpl#update()");
    throw new Error("Method not implemented.");
  }
}
