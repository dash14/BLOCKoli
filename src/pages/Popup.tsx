import { PopupController } from "@/modules/clients/PopupController";
import { State } from "@/modules/core/state";
import { css } from "@emotion/react";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";

const controller = new PopupController();

const page = css`
  margin: 40px;
`;

function Popup() {
  const [buttonText, setButtonText] = useState("");

  useEffect(function () {
    controller.initialize(setState);

    return function () {
      controller.destroy();
    };
  }, []);

  function setState(state: State) {
    setButtonText(state === "enable" ? "Disable" : "Enable");
  }

  function toggleEnable() {
    controller.toggleEnable();
  }

  return (
    <div css={page}>
      <h1>Popup</h1>
      <Button variant="contained" onClick={toggleEnable}>
        {buttonText}
      </Button>
    </div>
  );
}

export default Popup;
