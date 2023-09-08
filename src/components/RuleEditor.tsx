import {
  REQUEST_METHODS,
  RESOURCE_TYPES,
  RequestMethod,
  ResourceType,
  Rule,
  RuleActionType,
} from "@/modules/core/rules";
import { CloseIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import cloneDeep from "lodash-es/cloneDeep";
import { MultipleSelect } from "./MultipleSelect";
import { useState } from "react";

type Props = {
  rule: Rule;
  onChange: (rule: Rule) => void;
};

const requestMethodOptions = makeOptions(REQUEST_METHODS, (v) =>
  v.toUpperCase()
);
const resourceTypeOptions = makeOptions(RESOURCE_TYPES);

function makeOptions(
  values: string[],
  labeler: (v: string) => string = (v) => v
) {
  return values.map((v) => ({
    label: labeler(v),
    value: v,
  }));
}

export const RuleEditor: React.FC<Props> = ({
  rule: initialRule,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rule, setRuleObject] = useState(initialRule);

  function save() {
    onChange(rule);
    setIsEditing(false);
  }

  function cancel() {
    setRuleObject(initialRule);
    setIsEditing(false);
  }

  function updateAction(value: RuleActionType) {
    const newRule = cloneDeep(rule);
    newRule.action.type = value;
    setRuleObject(newRule);
  }

  function updateRequestMethods(value: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestMethods = value as RequestMethod[];
    setRuleObject(newRule);
  }

  function updateResourceTypes(value: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.resourceTypes = value as ResourceType[];
    setRuleObject(newRule);
  }

  return (
    <Box position="relative">
      {!isEditing && (
        <Button
          variant="ghost"
          position="absolute"
          size="sm"
          leftIcon={<EditIcon />}
          top={1}
          right={1}
          onClick={() => setIsEditing(!isEditing)}
        >
          Edit
        </Button>
      )}
      <Box aria-labelledby="title-action">
        <h4 id="title-action">Action</h4>
        <Box marginLeft="20px">
          {isEditing ? (
            <RadioGroup value={rule.action.type} onChange={updateAction}>
              <Stack direction="row">
                <Radio value="block" colorScheme="red">
                  block
                </Radio>
                <Radio value="allow" colorScheme="green">
                  allow
                </Radio>
              </Stack>
            </RadioGroup>
          ) : (
            <>
              <Text
                as="span"
                marginRight={1}
                color={
                  rule.action.type === RuleActionType.BLOCK ? "red" : "green"
                }
              >
                &#9679;
              </Text>
              {rule.action.type}
            </>
          )}
        </Box>
      </Box>
      <Box aria-labelledby="title-condition">
        <h4 id="title-condition">Condition</h4>
        <Grid
          marginLeft="20px"
          templateColumns="repeat(2, 1fr)"
          gridTemplateColumns="auto 1fr"
          gap="3"
        >
          <GridItem>Request Method</GridItem>
          <GridItem>
            <MultipleSelect
              placeholder="(ALL)"
              options={requestMethodOptions}
              value={rule.condition.requestMethods}
              onChange={updateRequestMethods}
            />
          </GridItem>
          <GridItem>Initiator Domain</GridItem>
          <GridItem>
            Multiple entries may be specified by separating them with ",".
          </GridItem>

          <GridItem>URL Filter</GridItem>
          <GridItem>
            Using Regular Expressions. See here for available formats
          </GridItem>
          <GridItem>Resource Type</GridItem>
          <GridItem>
            <MultipleSelect
              placeholder="(ALL)"
              options={resourceTypeOptions}
              value={rule.condition.resourceTypes}
              onChange={updateResourceTypes}
            />
          </GridItem>
        </Grid>
      </Box>
      {isEditing && (
        <ButtonGroup size="sm">
          <Button leftIcon={<EditIcon />} onClick={save}>
            Save
          </Button>
          <Button variant="outline" leftIcon={<CloseIcon />} onClick={cancel}>
            Cancel
          </Button>
        </ButtonGroup>
      )}
    </Box>
  );
};
