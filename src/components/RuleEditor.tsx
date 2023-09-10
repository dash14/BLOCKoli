import {
  REQUEST_METHODS,
  RESOURCE_TYPES,
  RequestMethod,
  ResourceType,
  Rule,
  RuleActionType,
} from "@/modules/core/rules";
import {
  CheckCircleIcon,
  EditIcon,
  NotAllowedIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  ListItem,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import cloneDeep from "lodash-es/cloneDeep";
import { MultipleSelect } from "./MultipleSelect";
import { useState } from "react";
import { Tags } from "./Tags";
import { HintPopover } from "./HintPopover";
import { ExternalLink } from "./ExternalLink";
import { RuleBox } from "./RuleBox";
import { RuleValidator } from "@/modules/core/validation";
import { RemoveButton } from "./RemoveButton";
import { RuleMenu } from "./RuleMenu";

type Props = {
  rule: Rule;
  isEditing: boolean;
  isRemoveEnabled: boolean;
  onChange: (rule: Rule) => void;
  onCancel: () => void;
  onRemove: () => void;
  onEditingChange: (isEditing: boolean) => void;
  ruleValidator: RuleValidator;
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
  isEditing,
  isRemoveEnabled,
  onChange,
  onCancel,
  onRemove,
  onEditingChange,
  ruleValidator,
}) => {
  const [rule, setRuleObject] = useState(initialRule);
  const [domains, setDomains] = useState(
    rule.condition.initiatorDomains?.join(",") ?? ""
  );
  const [isValid, setIsValid] = useState(false);
  const [regexInvalidReason, setRegexInvalidReason] = useState("");

  function save() {
    onEditingChange(false);
    onChange(rule);
  }

  function cancel() {
    onEditingChange(false);
    setRuleObject(initialRule);
    onCancel();
  }

  function remove() {
    onRemove();
  }

  function updateAction(value: RuleActionType) {
    const newRule = cloneDeep(rule);
    newRule.action.type = value;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateRequestMethods(value: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestMethods = value as RequestMethod[];
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateResourceTypes(value: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.resourceTypes = value as ResourceType[];
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateIsRegexFilter(checked: boolean) {
    const newRule = cloneDeep(rule);
    newRule.condition.isRegexFilter = checked;
    setRuleObject(newRule);
    validate(newRule);
  }

  async function updateUrlFilter(text: string) {
    const newRule = cloneDeep(rule);
    newRule.condition.urlFilter = text;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateInitiatorDomains(text: string) {
    setDomains(text);
    const domains = text
      .split(",")
      .map((text) => text.trim())
      .filter(Boolean);

    const newRule = cloneDeep(rule);
    newRule.condition.initiatorDomains = domains;
    setRuleObject(newRule);
    validate(newRule);
  }

  async function validate(newRule: Rule) {
    const result = await ruleValidator(newRule);
    if (result.isValid) {
      setRegexInvalidReason("");
      setIsValid(true);
    } else {
      if (result.reason?.isInvalidUrlFilter) {
        setRegexInvalidReason(result.reason?.urlFilterReason ?? "");
      }
      setIsValid(false);
    }
  }

  return (
    <RuleBox isEditing={isEditing}>
      <Box position="absolute" top={1} right={1}>
        {isEditing ? (
          <Tag size="sm" backgroundColor="blue.500" color="white">
            Editing
          </Tag>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<EditIcon />}
              onClick={() => onEditingChange(!isEditing)}
            >
              Edit
            </Button>
            {isRemoveEnabled && <RuleMenu onRemove={remove} />}
          </>
        )}
      </Box>
      <Box>
        <Heading as="h4" size="sm" marginBottom={2}>
          Action
        </Heading>
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
            <HStack gap={1}>
              {rule.action.type === RuleActionType.BLOCK ? (
                <NotAllowedIcon color="red" />
              ) : (
                <CheckCircleIcon color="green" />
              )}
              <Text as="span">{rule.action.type}</Text>
            </HStack>
          )}
        </Box>
      </Box>

      <Box marginTop={4} marginBottom={4}>
        <Heading as="h4" size="sm" marginBottom={2}>
          Condition
        </Heading>
        <Grid
          marginLeft="20px"
          templateColumns="repeat(2, 1fr)"
          gridTemplateColumns="auto 1fr"
          gap="5"
        >
          <GridItem>Request Methods</GridItem>
          {isEditing ? (
            <GridItem width={400}>
              <MultipleSelect
                placeholder="(ALL)"
                options={requestMethodOptions}
                value={rule.condition.requestMethods}
                onChange={updateRequestMethods}
              />
            </GridItem>
          ) : (
            <GridItem>
              <Tags
                empty="(ALL)"
                options={requestMethodOptions}
                values={rule.condition.requestMethods}
              />
            </GridItem>
          )}

          <GridItem>URL Filter</GridItem>
          <GridItem>
            {isEditing ? (
              <HStack>
                <Input
                  value={rule.condition.urlFilter ?? ""}
                  onChange={(e) => updateUrlFilter(e.target.value)}
                  width={400}
                  variant="outline"
                  placeholder={
                    rule.condition.isRegexFilter
                      ? "^https?://www\\.example\\.com/api/"
                      : "||www.example.com"
                  }
                />

                <Box whiteSpace="nowrap">
                  <Checkbox
                    defaultChecked={rule.condition.isRegexFilter}
                    checked={rule.condition.isRegexFilter}
                    onChange={(e) => updateIsRegexFilter(e.target.checked)}
                  >
                    Use regex
                  </Checkbox>
                </Box>
              </HStack>
            ) : (
              <Box>
                {rule.condition.urlFilter ? (
                  <>
                    <Tag>{rule.condition.urlFilter}</Tag>
                    {rule.condition.isRegexFilter ? " (regex)" : ""}
                  </>
                ) : (
                  <Tag>(Not specified)</Tag>
                )}
              </Box>
            )}
            {regexInvalidReason && (
              <Text color="red">{regexInvalidReason}</Text>
            )}
            For available formats, see{" "}
            {rule.condition.isRegexFilter ? (
              <ExternalLink href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#property-RuleCondition-regexFilter">
                API reference (regexFilter)
              </ExternalLink>
            ) : (
              <ExternalLink href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#filter-matching-charactgers">
                API reference (urlFilter)
              </ExternalLink>
            )}
            .
          </GridItem>

          <GridItem>Initiator Domains</GridItem>
          <GridItem>
            <HStack>
              {isEditing ? (
                <Input
                  value={domains}
                  onChange={(e) => updateInitiatorDomains(e.target.value)}
                  variant="outline"
                  placeholder="www.example.com, ..."
                  width={400}
                />
              ) : (
                <HStack>
                  {rule.condition.initiatorDomains ? (
                    (rule.condition.initiatorDomains ?? []).map((domain) => (
                      <Tag>{domain}</Tag>
                    ))
                  ) : (
                    <Tag>(Not specified)</Tag>
                  )}
                </HStack>
              )}

              <HintPopover title="Initiator Domains" width={400}>
                The rule will only match network requests originating from the
                list of initiator domains. If the list is empty, the rule is
                applied to requests from all domains.
                <Box>Note:</Box>
                <UnorderedList marginLeft={5}>
                  <ListItem>
                    Sub-domains like "a.example.com" are also allowed.
                  </ListItem>
                  <ListItem>
                    The entries must consist of only ascii characters.
                  </ListItem>
                  <ListItem>
                    Use punycode encoding for internationalized domains.
                  </ListItem>
                  <ListItem>
                    This matches against the request initiator and not the
                    request url.
                  </ListItem>
                  <ListItem>
                    Sub-domains of the listed domains are also matched.
                  </ListItem>
                </UnorderedList>
              </HintPopover>
            </HStack>
            {isEditing && (
              <Text fontSize={12}>
                Specify the origination of the request as a comma-separated
                list.
              </Text>
            )}
          </GridItem>

          <GridItem>Resource Types</GridItem>
          {isEditing ? (
            <GridItem width={400}>
              <MultipleSelect
                placeholder="(ALL)"
                options={resourceTypeOptions}
                value={rule.condition.resourceTypes}
                onChange={updateResourceTypes}
              />
            </GridItem>
          ) : (
            <GridItem>
              <Tags
                empty="(ALL)"
                options={resourceTypeOptions}
                values={rule.condition.resourceTypes}
              />
            </GridItem>
          )}
        </Grid>
      </Box>
      {isEditing && (
        <ButtonGroup size="sm" width="100%">
          <Button leftIcon={<EditIcon />} onClick={save} isDisabled={!isValid}>
            Save
          </Button>
          <Button
            variant="outline"
            leftIcon={<SmallCloseIcon />}
            onClick={cancel}
          >
            Cancel
          </Button>
          {isRemoveEnabled && (
            <RemoveButton style={{ marginLeft: "auto" }} onClick={remove} />
          )}
        </ButtonGroup>
      )}
    </RuleBox>
  );
};
