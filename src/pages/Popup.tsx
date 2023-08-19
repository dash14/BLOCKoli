import { PopupController } from "@/modules/clients/PopupController";
import { css } from "@emotion/react";
import Button from "@mui/material/Button";

const controller = new PopupController();

async function onClick() {
  await controller.onClick();
}

const page = css`
  margin: 40px;
`;
function Popup() {
  return (
    <div css={page}>
      <h1>Popup</h1>
      <Button variant="contained" onClick={onClick}>
        Popup
      </Button>
    </div>
  );
}

export default Popup;
