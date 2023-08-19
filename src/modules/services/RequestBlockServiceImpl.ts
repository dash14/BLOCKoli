import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";

export class RequestBlockServiceImpl
  extends ServiceBase<RequestBlock.Events>
  implements RequestBlock.Service
{
  constructor(emitter: EventEmitter<RequestBlock.Events>) {
    super(emitter);
  }

  public start(): void {
    console.log("RequestBlockServiceImpl#start()");
  }

  async enable(): Promise<void> {
    console.log("RequestBlockServiceImpl#enable()");
    this.emitter.emit("changeState", "enable");
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
