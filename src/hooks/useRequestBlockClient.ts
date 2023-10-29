import { useEffect, useState } from "react";
import isEqual from "lodash-es/isEqual";
import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import { ExportedRuleSets } from "@/modules/rules/export";
import { StoredRuleSets } from "@/modules/rules/stored";
import { RuleSetsValidationError } from "@/modules/rules/validation/RuleSets";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import logging from "@/modules/utils/logging";
import { updateI18nLanguage } from "./useI18n";

const log = logging.getLogger("client");

export function useRequestBlockClient() {
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ruleSets, setRuleSets] = useState<StoredRuleSets>([]);
  const [language, setLanguageState] = useState<string>("en");

  const service = new MessageProxyFactory().create<RequestBlock.Service>(
    RequestBlock.ServiceId
  );

  service.addEventListener("changeState", (state) =>
    setEnabled(state === "enable")
  );

  service.addEventListener("updateRuleSets", setRuleSets);

  useEffect(function () {
    log.debug("initialize");

    (async () => {
      setEnabled(await service.isEnabled());
      setRuleSets(await service.getRuleSets());
      const lang = await service.getLanguage();
      updateI18nLanguage(lang);
      setLanguageState(lang);
      setLoaded(true);
    })();

    return () => {
      log.debug("destroy");
      service.removeAllEventListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeState = async (enabled: boolean) => {
    if (enabled) {
      await service.enable();
    } else {
      await service.disable();
    }
  };

  const updateRuleSets = async (updatedRuleSets: StoredRuleSets) => {
    if (!isEqual(updatedRuleSets, ruleSets)) {
      await service.updateRuleSets(updatedRuleSets);
      setRuleSets(updatedRuleSets);
    }
  };

  const getMatchedRule = async () => {
    return await service.getMatchedRules();
  };

  const setLanguage = async (lang: string) => {
    updateI18nLanguage(lang);
    setLanguageState(lang);
    await service.setLanguage(lang);
  };

  const performExport = async (): Promise<ExportedRuleSets> => {
    return await service.export();
  };

  const performImport = async (
    object: object
  ): Promise<[boolean, RuleSetsValidationError[]]> => {
    return await service.import(object);
  };

  return {
    loaded,
    enabled,
    ruleSets,
    language,
    changeState,
    updateRuleSets,
    getMatchedRule,
    setLanguage,
    performExport,
    performImport,
  };
}
