import Button from '@mui/material/Button';
import { useI18n } from '../hooks/useI18n';

function Options() {
  const i18n = useI18n()
  return (
    <>
      <h1>{i18n["Options"]}</h1>
      <h2>{i18n["GeneralSettings"]}</h2>
      <Button variant="contained">Options</Button>

      <h2>{i18n["RuleSettings"]}</h2>
    </>
  )
}

export default Options
