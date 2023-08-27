import { MatchedRuleInfo } from "@/modules/chrome/api";
import { ChromeApiFactory } from "@/modules/chrome/factory";
import { PopupController } from "@/modules/clients/PopupController";
import { State } from "@/modules/core/state";
import logging from "@/modules/utils/logging";
import { css } from "@emotion/react";
import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const log = logging.getLogger("react(popup)");

const controller = new PopupController(
  new ChromeApiFactory().declarativeNetRequest()
);

const page = css`
  margin: 40px;
`;

function Popup() {
  const [buttonText, setButtonText] = useState("");
  const [rules, setRules] = useState<MatchedRuleInfo[]>([]);

  useEffect(function () {
    log.debug("initialize");
    controller.initialize(setState);
    updateMatchedRules();

    return function () {
      log.debug("destroy");
      controller.destroy();
    };
  }, []);

  function setState(state: State) {
    setButtonText(state === "enable" ? "Disable" : "Enable");
  }

  function toggleEnable() {
    controller.toggleEnable();
  }

  async function updateMatchedRules() {
    setRules(await controller.getMatchedRulesInActiveTab());
  }

  return (
    <div css={page}>
      <h1>Popup</h1>
      <Button onClick={toggleEnable}>{buttonText}</Button>
      <Button onClick={updateMatchedRules}>Get matched rules</Button>
      {JSON.stringify(rules)}
    </div>
  );
}

export default Popup;
