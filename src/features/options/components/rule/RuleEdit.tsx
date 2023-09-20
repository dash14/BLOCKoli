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
import { useRuleEdit } from "@/features/options/hooks/useRuleEdit";
import { useI18n } from "@/hooks/useI18n";
import {
  REQUEST_METHODS,
  RESOURCE_TYPES,
  Rule,
  RuleActionType,
} from "@/modules/core/rules";
import { InitiatorDomainsHint } from "../hints/InitiatorDomainsHint";
import { RequestDomainsHint } from "../hints/RequestDomainsHint";
import { RequestMethodsHint } from "../hints/RequestMethodsHint";
import { ResourceTypesHint } from "../hints/ResourceTypesHint";
import { URLFilterWithRegexHint } from "../hints/URLFilterWithRegexHint";
import { URLFilterHint } from "../hints/UrlFilterHint";
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
  const i18n = useI18n();
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
      width: "145px",
      paddingTop: "2px",
    }),
    note: css({
      marginTop: "2px",
      marginLeft: "145px",
    }),
  };

  return (
    <RuleContainer isEditing={isEditing}>
      <Box position="absolute" top={1} right={1}>
        {isEditing ? (
          <Tag size="sm" backgroundColor="blue.500" color="white">
            {i18n["Editing"]}
          </Tag>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<EditIcon />}
              onClick={enterEditMode}
            >
              {i18n["Edit"]}
            </Button>
            {isRemoveEnabled && <RuleMenu onRemove={remove} />}
          </>
        )}
      </Box>
      <Box>
        <Heading as="h4" size="sm" marginBottom={2}>
          {i18n["Action"]}
        </Heading>
        <Box marginLeft="20px">
          {isEditing ? (
            <RadioGroup value={rule.action.type} onChange={updateAction}>
              <Stack direction="row">
                <Radio value="block" colorScheme="red">
                  {i18n["action_block"]}
                </Radio>
                <Radio value="allow" colorScheme="green">
                  {i18n["action_allow"]}
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

      <Box marginTop={4}>
        <HStack alignItems="baseline">
          <Heading as="h4" size="sm" marginBottom={2}>
            {i18n["Condition"]}
          </Heading>
          <Text as="div" fontSize={13} color="#666">
            ({i18n["explain_condition"]})
          </Text>
        </HStack>
        <VStack marginLeft="20px" alignItems="start" gap={isEditing ? 5 : 2}>
          {/* Request Domains */}
          <Box>
            <FormControl css={styles.formControl}>
              <FormLabel css={styles.label}>{i18n["RequestDomains"]}</FormLabel>
              {isEditing ? (
                <Input
                  value={requestDomainsText}
                  onChange={(e) => updateRequestDomains(e.target.value)}
                  variant="outline"
                  placeholder="www.example.com, ..."
                  width={410}
                />
              ) : (
                <Tags
                  empty={i18n["NotSpecified"]}
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
              <FormLabel css={styles.label}>
                {i18n["InitiatorDomains"]}
              </FormLabel>
              {isEditing ? (
                <Input
                  value={initiatorDomainsText}
                  onChange={(e) => updateInitiatorDomains(e.target.value)}
                  variant="outline"
                  placeholder="www.example.com, ..."
                  width={410}
                />
              ) : (
                <Tags
                  empty={i18n["NotSpecified"]}
                  values={rule.condition.initiatorDomains}
                  marginTop="2px"
                />
              )}
              <Box marginLeft={2}>
                <InitiatorDomainsHint />
              </Box>
            </FormControl>
          </Box>

          {/* Request Methods */}
          <FormControl css={styles.formControl}>
            <FormLabel css={styles.label}>{i18n["RequestMethods"]}</FormLabel>
            {isEditing ? (
              <Box width={410}>
                <MultipleSelect
                  placeholder={i18n["ALL"]}
                  options={requestMethodOptions}
                  value={rule.condition.requestMethods}
                  onChange={updateRequestMethods}
                />
              </Box>
            ) : (
              <LabelTags
                empty={i18n["ALL"]}
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
            <FormControl
              css={styles.formControl}
              isInvalid={!!regexInvalidReason}
            >
              <FormLabel css={styles.label}>{i18n["URLFilter"]}</FormLabel>
              <HStack gap={0} alignItems="start">
                {isEditing ? (
                  <Input
                    value={rule.condition.urlFilter ?? ""}
                    onChange={(e) => updateUrlFilter(e.target.value)}
                    width={410}
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
                      <DisableTag>{i18n["NotSpecified"]}</DisableTag>
                    )}
                  </Box>
                )}
                <Box marginLeft={2}>
                  {rule.condition.isRegexFilter ? (
                    <URLFilterWithRegexHint />
                  ) : (
                    <URLFilterHint />
                  )}
                </Box>
              </HStack>
              <FormErrorMessage marginTop={1}>
                {regexInvalidReason}
              </FormErrorMessage>
            </FormControl>

            {isEditing ? (
              <HStack css={styles.note} alignItems="start">
                <FormControl paddingTop="2px" width="auto">
                  <Checkbox
                    defaultChecked={rule.condition.isRegexFilter}
                    checked={rule.condition.isRegexFilter}
                    onChange={(e) => updateIsRegexFilter(e.target.checked)}
                    size="sm"
                    marginTop="3px"
                  >
                    {i18n["UseRegex"]}
                  </Checkbox>
                </FormControl>
              </HStack>
            ) : (
              rule.condition.isRegexFilter &&
              rule.condition.urlFilter && (
                <HStack css={styles.note}>
                  <Text as="span"> ({i18n["UseRegex"]})</Text>
                </HStack>
              )
            )}
          </Box>

          {/* Resource Types */}
          <FormControl css={styles.formControl}>
            <FormLabel css={styles.label}>{i18n["ResourceTypes"]}</FormLabel>
            {isEditing ? (
              <Box width={410}>
                <MultipleSelect
                  placeholder={i18n["ALL"]}
                  options={resourceTypeOptions}
                  value={rule.condition.resourceTypes}
                  onChange={updateResourceTypes}
                />
              </Box>
            ) : (
              <LabelTags
                empty={i18n["ALL"]}
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
          marginTop={5}
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
