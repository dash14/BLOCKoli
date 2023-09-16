import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import { RuleSets } from "@/modules/core/rules";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import logging from "@/modules/utils/logging";
import { useEffect, useState } from "react";

const log = logging.getLogger("client");

export function useRequestBlockClient() {
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ruleSets, setRuleSets] = useState<RuleSets>([]);

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

  const updateRuleSets = async (ruleSets: RuleSets) => {
    await service.updateRuleSets(ruleSets);
    setRuleSets(ruleSets);
  };

  const getMatchedRule = async () => {
    return await service.getMatchedRules();
  };

  return {
    loaded,
    enabled,
    ruleSets,
    changeState,
    updateRuleSets,
    getMatchedRule,
  };
}
