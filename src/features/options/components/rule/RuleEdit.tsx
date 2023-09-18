import { CheckCircleIcon, EditIcon, NotAllowedIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { MultipleSelect } from "@/components/forms/MultipleSelect";
import { DisableTag } from "@/components/parts/DisableTag";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { LabelTags } from "@/components/parts/LabelTags";
import { Tags } from "@/components/parts/Tags";
import {
  REQUEST_METHODS,
  RESOURCE_TYPES,
  Rule,
  RuleActionType,
} from "@/modules/core/rules";
import { useRuleEdit } from "../../hooks/useRuleEdit";
import { InitiatorDomainsHint } from "../hints/InitiatorDomainsHint";
import { RegexHint } from "../hints/RegexHint";
import { RequestDomainsHint } from "../hints/RequestDomainsHint";
import { RequestMethodsHint } from "../hints/RequestMethodsHint";
import { ResourceTypesHint } from "../hints/ResourceTypesHint";
import { ControlButtons } from "./ControlButtons";
import { RuleContainer } from "./RuleContainer";
import { RuleMenu } from "./RuleMenu";

type Props = {
  rule: Rule;
  isRemoveEnabled: boolean;
  onChange: (rule: Rule) => void;
  onCancel: () => void;
  onRemove: () => void;
};

const requestMethodOptions = makeOptions(REQUEST_METHODS, (v) =>
  v.toUpperCase()
);
const resourceTypeOptions = makeOptions(RESOURCE_TYPES);

export const RuleEdit: React.FC<Props> = ({
  rule: initialRule,
  isRemoveEnabled,
  onChange,
  onCancel,
  onRemove,
}) => {
  const {
    save,
    cancel,
    remove,
    enterEditMode,
    updateAction,
    updateRequestMethods,
    updateResourceTypes,
    updateUrlFilter,
    updateIsRegexFilter,
    updateRequestDomains,
    updateInitiatorDomains,
    isEditing,
    rule,
    requestDomainsText,
    initiatorDomainsText,
    isValid,
    regexInvalidReason,
  } = useRuleEdit(initialRule, onChange, onCancel, onRemove);

  const styles = {
    formControl: css({
      display: "flex",
      flexDirection: "row",
      width: "auto",
      alignItems: "start",
    }),
    label: css({
      fontSize: 14,
      fontWeight: "normal",
      margin: 0,
      width: "130px",
      paddingTop: "2px",
    }),
    note: css({
      marginTop: "2px",
      marginLeft: "130px",
    }),
  };

  return (
    <RuleContainer isEditing={isEditing}>
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
              onClick={enterEditMode}
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
                <NotAllowedIcon color="red" boxSize={4} />
              ) : (
                <CheckCircleIcon color="green" boxSize={4} />
              )}
              <Text as="span" fontSize={16}>
                {rule.action.type}
              </Text>
            </HStack>
          )}
        </Box>
      </Box>

      <Box marginTop={4} marginBottom={4}>
        <HStack alignItems="baseline">
          <Heading as="h4" size="sm" marginBottom={2}>
            Condition
          </Heading>
          <Text as="div" fontSize={13} color="#666">
            (All rules are optional, but at least one must be specified)
          </Text>
        </HStack>
        <VStack marginLeft="20px" alignItems="start" gap={4}>
          {/* Request Methods */}
          <FormControl css={styles.formControl}>
            <FormLabel css={styles.label}>Request Methods</FormLabel>
            {isEditing ? (
              <Box width={450}>
                <MultipleSelect
                  placeholder="(ALL)"
                  options={requestMethodOptions}
                  value={rule.condition.requestMethods}
                  onChange={updateRequestMethods}
                />
              </Box>
            ) : (
              <LabelTags
                empty="(ALL)"
                options={requestMethodOptions}
                values={rule.condition.requestMethods}
                marginTop="2px"
              />
            )}
            <Box marginLeft={2}>
              <RequestMethodsHint />
            </Box>
          </FormControl>

          {/* URL Filter */}
          <Box>
            <HStack alignItems="start">
              <FormControl
                css={styles.formControl}
                isInvalid={!!regexInvalidReason}
              >
                <FormLabel css={styles.label}>URL Filter</FormLabel>
                <Box>
                  {isEditing ? (
                    <Input
                      value={rule.condition.urlFilter ?? ""}
                      onChange={(e) => updateUrlFilter(e.target.value)}
                      width={450}
                      variant="outline"
                      placeholder={
                        rule.condition.isRegexFilter
                          ? "^https?://www\\.example\\.com/api/"
                          : "||www.example.com*^123"
                      }
                    />
                  ) : (
                    <Box marginTop="2px">
                      {rule.condition.urlFilter ? (
                        <Tag>{rule.condition.urlFilter}</Tag>
                      ) : (
                        <DisableTag>(Not specified)</DisableTag>
                      )}
                    </Box>
                  )}
                  <FormErrorMessage marginTop={1}>
                    {regexInvalidReason}
                  </FormErrorMessage>
                </Box>
              </FormControl>
              {isEditing ? (
                <FormControl paddingTop="2px" width="auto">
                  <Checkbox
                    defaultChecked={rule.condition.isRegexFilter}
                    checked={rule.condition.isRegexFilter}
                    onChange={(e) => updateIsRegexFilter(e.target.checked)}
                    size="sm"
                    marginTop="3px"
                  >
                    Use regex
                  </Checkbox>
                </FormControl>
              ) : (
                rule.condition.isRegexFilter &&
                rule.condition.urlFilter && <Text as="span">" (regex)"</Text>
              )}
              <RegexHint />
            </HStack>
            {(isEditing || rule.condition.urlFilter) && (
              <Text as="div" css={styles.note}>
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
              </Text>
            )}
          </Box>

          {/* Request Domains */}
          <Box>
            <FormControl css={styles.formControl}>
              <FormLabel css={styles.label}>Request Domains</FormLabel>
              {isEditing ? (
                <Input
                  value={requestDomainsText}
                  onChange={(e) => updateRequestDomains(e.target.value)}
                  variant="outline"
                  placeholder="www.example.com, ..."
                  width={450}
                />
              ) : (
                <Tags
                  empty="(Not specified)"
                  values={rule.condition.requestDomains}
                  marginTop="2px"
                />
              )}
              <Box marginLeft={2}>
                <RequestDomainsHint />
              </Box>
            </FormControl>
          </Box>

          {/* Initiator Domains */}
          <Box>
            <FormControl css={styles.formControl}>
              <FormLabel css={styles.label}>Initiator Domains</FormLabel>
              {isEditing ? (
                <Input
                  value={initiatorDomainsText}
                  onChange={(e) => updateInitiatorDomains(e.target.value)}
                  variant="outline"
                  placeholder="www.example.com, ..."
                  width={450}
                />
              ) : (
                <Tags
                  empty="(Not specified)"
                  values={rule.condition.initiatorDomains}
                  marginTop="2px"
                />
              )}
              <Box marginLeft={2}>
                <InitiatorDomainsHint />
              </Box>
            </FormControl>
          </Box>

          {/* Resource Types */}
          <FormControl css={styles.formControl}>
            <FormLabel css={styles.label}>Resource Types</FormLabel>
            {isEditing ? (
              <Box width={450}>
                <MultipleSelect
                  placeholder="(ALL)"
                  options={resourceTypeOptions}
                  value={rule.condition.resourceTypes}
                  onChange={updateResourceTypes}
                />
              </Box>
            ) : (
              <LabelTags
                empty="(ALL)"
                options={resourceTypeOptions}
                values={rule.condition.resourceTypes}
                marginTop="2px"
              />
            )}
            <Box marginLeft={2}>
              <ResourceTypesHint />
            </Box>
          </FormControl>
        </VStack>
      </Box>
      {isEditing && (
        <ControlButtons
          save={save}
          cancel={cancel}
          remove={remove}
          isValid={isValid}
          isRemoveEnabled={isRemoveEnabled}
        />
      )}
    </RuleContainer>
  );
};

function makeOptions(
  values: string[],
  labeler: (v: string) => string = (v) => v
) {
  return values.map((v) => ({
    label: labeler(v),
    value: v,
  }));
}
