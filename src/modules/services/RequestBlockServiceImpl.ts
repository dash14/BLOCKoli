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
    const state = await this.store.loadState();
    console.log("RequestBlockServiceImpl#start(), state:", state);
    if (state === "enable") {
      await this.enable();
    }
  }

  async enable(): Promise<void> {
    console.log("RequestBlockServiceImpl#enable()");
    const state = await this.store.loadState();
    if (state === "enable") return;

    // TODO: enable

    await this.store.saveState("enable");
    this.emitter.emit("changeState", "enable");
  }

  async disable(): Promise<void> {
    console.log("RequestBlockServiceImpl#enable()");
    const state = await this.store.loadState();
    if (state === "disable") return;

    // TODO: disable

    await this.store.saveState("disable");
    this.emitter.emit("changeState", "disable");
  }

  async isEnabled(): Promise<boolean> {
    console.log("RequestBlockServiceImpl#isEnabled()");
    return (await this.store.loadState()) === "enable";
  }

  async update(): Promise<void> {
    console.log("RequestBlockServiceImpl#update()");
    throw new Error("Method not implemented.");
  }
}
