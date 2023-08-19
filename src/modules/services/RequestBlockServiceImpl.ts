import * as RequestBlock from "@/modules/services/RequestBlockService";
import { Service } from "@/modules/core/service";

export class RequestBlockServiceImpl
  extends Service<RequestBlock.Events>
  implements RequestBlock.Service
{
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
