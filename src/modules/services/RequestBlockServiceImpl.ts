import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import { ChromeApiDeclarativeNetRequest } from "@/modules/chrome/api";
import logging from "@/modules/utils/logging";

const log = logging.getLogger("RequestBlock");

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
    if (state === "enable") {
      log.debug("start");
      await this.run();
    }
  }

  public async enable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "enable") return;

    log.debug("enable");

    this.run();

    await this.store.saveState("enable");
    this.emitter.emit("changeState", "enable");
  }

  public async disable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "disable") return;

    log.debug("disable");

    // clear rules
    await this.chrome.removeAllDynamicRules();

    await this.store.saveState("disable");
    this.emitter.emit("changeState", "disable");
  }

  public async isEnabled(): Promise<boolean> {
    return (await this.store.loadState()) === "enable";
  }

  public async update(): Promise<void> {
    log.debug("update");
    throw new Error("Method not implemented.");
  }

  private async run(): Promise<void> {
    // clear rules
    await this.chrome.removeAllDynamicRules();

    const rules = await this.store.loadRules();
    if (rules.length === 0) return;

    this.chrome.updateDynamicRules({ addRules: rules });
  }
}
