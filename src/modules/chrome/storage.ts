import { ChromeStorageApi } from "./api";

export class ChromeStorageApiImpl implements ChromeStorageApi {
  private area: chrome.storage.StorageArea;

  constructor(area: chrome.storage.StorageArea) {
    this.area = area;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.area.get(key))[key];
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.area.set({ [key]: value });
  }

  async remove(key: string): Promise<void> {
    await this.area.remove(key);
  }
}
