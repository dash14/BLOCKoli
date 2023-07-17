import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useI18n } from "../hooks/useI18n";
import { useState } from "react";
import MethodSelect from "@/components/MethodSelect";
import { IconButton } from "@mui/material";

function Options() {
  const i18n = useI18n();
  const [timeToReapply, setTimeToReapply] = useState(5);
  const handleChangeTimeToReapply = (event: SelectChangeEvent<number>) => {
    const value = event.target.value;
    setTimeToReapply(value as number);
  };

  const [methods, setMethods] = useState([] as string[]);
  const handleChangeMethods = (methods: string[]) => {
    console.log("handle", methods);
    setMethods(methods);
  };

  const editingRuleSets = [
    {
      name: "Rule 1",
      blockRules: [{ url: "https://*.example.com/*", methods: [] }],
      passRules: [{ url: "https://*.example.com/login", methods: ["post"] }],
      injectStyle: {
        enable: true,
        url: "https://www.example.com/*",
        enabledCss: "body { background-color: red; }",
        disabledCss: "body { background-color: gray; }",
      },
    },
  ];

  return (
    <>
      <h1>{i18n["Options"]}</h1>
      <section aria-labelledby="GeneralSettingsTitle">
        <h2 id="GeneralSettingsTitle">{i18n["GeneralSettings"]}</h2>
        <FormControlLabel
          control={<Checkbox defaultChecked size="small" />}
          label={i18n["AutoStart"]}
        />
        <div>
          <Select
            value={timeToReapply}
            onChange={handleChangeTimeToReapply}
            size="small"
          >
            <MenuItem value={5}>5 minutes later</MenuItem>
            <MenuItem value={10}>10 minutes later</MenuItem>
            <MenuItem value={30}>30 minutes later</MenuItem>
            <MenuItem value={60}>1 hour later</MenuItem>
          </Select>
        </div>
      </section>

      <section aria-labelledby="RuleSettingsTitle">
        <h2 id="RuleSettingsTitle">{i18n["RuleSettings"]}</h2>
        <div>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "capitalize" }}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "capitalize" }}
          >
            Export
          </Button>
        </div>
        <ul>
          {editingRuleSets.map((ruleSet, ruleSetIndex) => (
            <li key={ruleSetIndex}>
              <div>
                <TextField
                  label="name"
                  variant="standard"
                  value={ruleSet.name}
                />
                <div>
                  <label>BLOCK</label>
                  <ul>
                    {ruleSet.blockRules.map((rule, ruleIndex) => (
                      <li key={ruleIndex}>
                        <TextField
                          label="url"
                          variant="outlined"
                          size="small"
                          value={rule.url}
                        />
                        <MethodSelect
                          methods={methods}
                          onChanged={handleChangeMethods}
                          sx={{ width: 300 }}
                        />
                        <IconButton aria-label="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                  <IconButton aria-label="Add">
                    <AddIcon />
                  </IconButton>
                </div>
                <div>
                  <label>PASS through</label>
                  <ul>
                    {ruleSet.passRules.map((rule, ruleIndex) => (
                      <li key={ruleIndex}>
                        <TextField
                          label="url"
                          variant="outlined"
                          size="small"
                          value={rule.url}
                        />
                        <MethodSelect
                          methods={methods}
                          onChanged={handleChangeMethods}
                          sx={{ width: 300 }}
                        />
                        <IconButton aria-label="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                  <IconButton aria-label="Add">
                    <AddIcon />
                  </IconButton>
                </div>
                <div>
                  <label>Inject Style</label>
                  <div>
                    <Checkbox size="small" />
                    <div>
                      <TextField
                        label="Page URL"
                        size="small"
                        variant="outlined"
                      />
                      <TextField
                        label="for Enabled"
                        size="small"
                        variant="outlined"
                        multiline
                        minRows={3}
                        maxRows={6}
                      />
                      <TextField
                        label="for Disabled"
                        size="small"
                        variant="outlined"
                        multiline
                        minRows={3}
                        maxRows={6}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                size="small"
                color="error"
                sx={{ textTransform: "capitalize" }}
              >
                Delete this rule set
              </Button>
            </li>
          ))}
        </ul>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          size="small"
          sx={{ textTransform: "capitalize" }}
        >
          Add new rule set
        </Button>
      </section>
    </>
  );
}

export default Options;
