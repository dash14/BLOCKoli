import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import { ChromeApiDeclarativeNetRequest } from "@/modules/chrome/api";

export class RequestBlockServiceImpl
  extends ServiceBase<RequestBlock.Events>
  implements RequestBlock.Service
{
  private store: ServiceConfigurationStore;
  private chrome: ChromeApiDeclarativeNetRequest;

  constructor(
    emitter: EventEmitter<RequestBlock.Events>,
    store: ServiceConfigurationStore,
    chrome: ChromeApiDeclarativeNetRequest
  ) {
    super(emitter);
    this.store = store;
    this.chrome = chrome;
  }

  public async start(): Promise<void> {
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
