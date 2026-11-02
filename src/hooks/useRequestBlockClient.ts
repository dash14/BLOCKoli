import { useEffect, useRef, useState } from "react";
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
  const [loadFailed, setLoadFailed] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ruleSets, setRuleSets] = useState<StoredRuleSets>([]);
  const [language, setLanguageState] = useState<string>("en");
  // A language picked on this page during the initial load wins over the loaded one.
  const languageChosen = useRef(false);

  // Keep one proxy per mount so the effect adds and removes a single onMessage listener.
  const [service] = useState(() =>
    new MessageProxyFactory().create<RequestBlock.Service>(
      RequestBlock.ServiceId
    )
  );

  useEffect(function () {
    log.debug("initialize");

    let active = true;
    // A broadcast received during the initial load is newer than what the load returns.
    let stateBroadcast = false;
    let ruleSetsBroadcast = false;

    service.addEventListener("changeState", (state) => {
      stateBroadcast = true;
      setEnabled(state === "enable");
    });
    service.addEventListener("updateRuleSets", (ruleSets) => {
      ruleSetsBroadcast = true;
      setRuleSets(ruleSets);
    });

    (async () => {
      try {
        // Set nothing until every call succeeds, so a failure leaves no partial state.
        const isEnabled = await service.isEnabled();
        const storedRuleSets = await service.getRuleSets();
        const lang = await service.getLanguage();
        if (!active) return;
        if (!stateBroadcast) setEnabled(isEnabled);
        if (!ruleSetsBroadcast) setRuleSets(storedRuleSets);
        if (!languageChosen.current) {
          updateI18nLanguage(lang);
          setLanguageState(lang);
        }
        setLoaded(true);
      } catch (error) {
        if (!active) return;
        log.error("failed to load the initial state", error);
        setLoadFailed(true);
      }
    })();

    return () => {
      log.debug("destroy");
      active = false;
      service.removeAllEventListeners();
    };
  }, [service]);

  const changeState = async (enabled: boolean) => {
    if (enabled) {
      await service.enable();
    } else {
      await service.disable();
    }
  };

  // Compare with the latest state, not the one this render's callbacks closed over.
  const latestRuleSets = useRef(ruleSets);
  useEffect(() => {
    latestRuleSets.current = ruleSets;
  }, [ruleSets]);

  const updateRuleSets = async (updatedRuleSets: StoredRuleSets) => {
    if (!isEqual(updatedRuleSets, latestRuleSets.current)) {
      // New rules come back with the IDs the service assigned
      setRuleSets(await service.updateRuleSets(updatedRuleSets));
    }
  };

  const getMatchedRule = async () => {
    return await service.getMatchedRules();
  };

  const setLanguage = async (lang: string) => {
    languageChosen.current = true;
    updateI18nLanguage(lang);
    setLanguageState(lang);
    await service.setLanguage(lang);
  };

  const performExport = async (): Promise<ExportedRuleSets> => {
    return await service.export();
  };

  const performImport = async (
    object: unknown
  ): Promise<[boolean, RuleSetsValidationError[]]> => {
    return await service.import(object);
  };

  return {
    loaded,
    loadFailed,
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
