import { useCallback, useEffect, useRef, useState } from "react";
import isEqual from "lodash-es/isEqual";
import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import { SaveConflictError } from "@/modules/rules/conflict";
import { ExportedRuleSets } from "@/modules/rules/export";
import { StoredRuleSets, VersionedRuleSets } from "@/modules/rules/stored";
import { RuleSetsValidationError } from "@/modules/rules/validation/RuleSets";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import logging from "@/modules/utils/logging";
import { updateI18nLanguage } from "./useI18n";

const log = logging.getLogger("client");

// Save attempts before giving up, when other pages keep saving first
const MAX_SAVE_ATTEMPTS = 3;

function isStale(error: unknown) {
  return (
    error instanceof Error &&
    error.message === RequestBlock.STALE_RULE_SETS_ERROR
  );
}

export function useRequestBlockClient() {
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ruleSets, setRuleSets] = useState<StoredRuleSets>([]);
  const [language, setLanguageState] = useState<string>("en");
  // A language picked on this page during the initial load wins over the loaded one.
  const languageChosen = useRef(false);

  // Responses and broadcasts arrive by separate channels, so the revision decides which is newer.
  const appliedRevision = useRef(-1);
  // Each change waits for the save before it and applies to what that save stored
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  // Broadcasts are held during a save, so a rule it adds is not shown twice before the response
  const saving = useRef(false);
  const held = useRef<VersionedRuleSets | undefined>(undefined);

  // Changes apply to the latest state, not the one this render's callbacks closed over
  const latestRuleSets = useRef<StoredRuleSets>([]);

  const receiveRuleSets = useCallback((received: VersionedRuleSets) => {
    if (received.revision > appliedRevision.current) {
      appliedRevision.current = received.revision;
      latestRuleSets.current = received.ruleSets;
      setRuleSets(received.ruleSets);
    }
  }, []);

  const receiveBroadcast = useCallback(
    (received: VersionedRuleSets) => {
      if (!saving.current) {
        receiveRuleSets(received);
      } else if (!held.current || received.revision > held.current.revision) {
        held.current = received;
      }
    },
    [receiveRuleSets]
  );

  // Keep one proxy per mount so the effect adds and removes a single onMessage listener.
  const [service] = useState(() =>
    new MessageProxyFactory().create<RequestBlock.Service>(
      RequestBlock.ServiceId
    )
  );

  useEffect(function () {
    log.debug("initialize");

    let active = true;
    // A state broadcast received during the initial load is newer than what the load returns.
    let stateBroadcast = false;

    service.addEventListener("changeState", (state) => {
      stateBroadcast = true;
      setEnabled(state === "enable");
    });
    service.addEventListener("updateRuleSets", receiveBroadcast);

    (async () => {
      try {
        // Set nothing until every call succeeds, so a failure leaves no partial state.
        const isEnabled = await service.isEnabled();
        const storedRuleSets = await service.getRuleSets();
        const lang = await service.getLanguage();
        if (!active) return;
        if (!stateBroadcast) setEnabled(isEnabled);
        receiveRuleSets(storedRuleSets);
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
  }, [service, receiveRuleSets, receiveBroadcast]);

  const changeState = async (enabled: boolean) => {
    if (enabled) {
      await service.enable();
    } else {
      await service.disable();
    }
  };


  // Resolves to the rule sets stored after the change, with the IDs the service gave new rules.
  // onSaved runs in the same step that shows them, so its state updates render with them.
  const updateRuleSets = (
    change: (stored: StoredRuleSets) => StoredRuleSets,
    onSaved?: (saved: StoredRuleSets) => void
  ): Promise<StoredRuleSets> => {
    const run = queue.current.then(async () => {
      for (let attempt = 1; ; attempt++) {
        const current = latestRuleSets.current;
        const updated = change(current);
        if (isEqual(updated, current)) {
          onSaved?.(current);
          return current;
        }
        saving.current = true;
        try {
          const saved = await service.updateRuleSets(
            updated,
            appliedRevision.current
          );
          receiveRuleSets(saved);
          onSaved?.(saved.ruleSets);
          return saved.ruleSets;
        } catch (error) {
          if (!isStale(error)) throw error;
          if (attempt >= MAX_SAVE_ATTEMPTS) throw new SaveConflictError();
        } finally {
          saving.current = false;
          if (held.current) {
            receiveRuleSets(held.current);
            held.current = undefined;
          }
        }
        // Another page saved first: apply the change again to what it stored
        receiveRuleSets(await service.getRuleSets());
      }
    });
    queue.current = run.catch(() => undefined);
    return run;
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
