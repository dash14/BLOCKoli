import { Theme } from "@emotion/react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
} from "@mui/material";
import React from "react";

const ALL = "all"; // selectable "All methods"
const __ALL__ = "__all__";

const METHODS = [
  "get",
  "head",
  "post",
  "put",
  "delete",
  "connect",
  "options",
  "trace",
  "patch",
];

interface Props {
  methods: string[];
  onChanged?: (methods: string[]) => void;
  sx?: SxProps<Theme>;
}

function isSelectedAllMethods(methods: string[]) {
  return (
    isIncludeAllMethods(methods) ||
    methods.includes(__ALL__) ||
    methods.length === 0
  );
}
function isIncludeAllMethods(methods: string[]) {
  return METHODS.every((v) => methods.includes(v));
}

export default function MethodSelect(props: Props) {
  const [methods, setMethods] = React.useState<string[]>(
    props.methods.length === 0 ? [__ALL__] : props.methods
  );

  const handleChange = (event: SelectChangeEvent<typeof methods>) => {
    const {
      target: { value },
    } = event;
    let values = typeof value === "string" ? value.split(",") : value;
    const hasAll = values.includes(ALL);
    values = values.filter((v) => ![ALL, __ALL__].includes(v));
    let valuesToNotify = values;
    if (hasAll) {
      values = values.length === METHODS.length ? [__ALL__] : [...METHODS];
      valuesToNotify = []; // All methods
    }
    setMethods(values);
    props.onChanged?.(valuesToNotify);
  };

  return (
    <FormControl>
      <InputLabel>Methods</InputLabel>
      <Select
        label="Methods"
        multiple
        value={methods}
        onChange={handleChange}
        size="small"
        sx={props.sx}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {isSelectedAllMethods(selected) ? (
              <Chip label={<em>All methods</em>} />
            ) : (
              selected.map((m) => <Chip key={m} label={m.toUpperCase()} />)
            )}
          </Box>
        )}
      >
        <MenuItem value="all">
          <em>All methods</em>
        </MenuItem>
        <hr />
        {METHODS.map((method) => (
          <MenuItem key={method} value={method}>
            {method.toUpperCase()}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
