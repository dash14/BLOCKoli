import { css } from "@emotion/react";
import Button from '@mui/material/Button';

const page = css`
  margin: 40px;
`
function Popup() {
  return (
    <div css={page}>
      <h1>Popup</h1>
      <Button variant="contained">Popup</Button>
    </div>
  )
}

export default Popup
