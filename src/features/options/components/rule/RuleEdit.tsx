import { CheckCircleIcon, EditIcon, NotAllowedIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { useRuleEdit } from "@/features/options/hooks/useRuleEdit";
import { useI18n } from "@/hooks/useI18n";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { InitiatorDomainsHint } from "../hints/InitiatorDomainsHint";
import { RequestDomainsHint } from "../hints/RequestDomainsHint";
import { RequestMethodsHint } from "../hints/RequestMethodsHint";
import { ResourceTypesHint } from "../hints/ResourceTypesHint";
import { URLFilterHint } from "../hints/URLFilterHint";
import { URLFilterWithRegexHint } from "../hints/URLFilterWithRegexHint";
import { ControlButtons } from "./ControlButtons";
import { RuleContainer } from "./RuleContainer";
import { RuleMenu } from "./RuleMenu";
import { FormErrorMessages } from "./controls/FormErrorMessage";
import { InputDomains } from "./controls/InputDomains";
import { InputRequestMethods } from "./controls/InputRequestMethods";
import { InputResourceTypes } from "./controls/InputResourceTypes";
import { InputUrlFilter } from "./controls/InputUrlFilter";
import { IsRegexFilter } from "./controls/IsRegexFilter";

type Props = {
  rule: Rule;
  isRemoveEnabled: boolean;
  onChange: (rule: Rule) => void;
  onCancel: () => void;
  onRemove: () => void;
};

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
    isValid,
    validationErrors,
  } = useRuleEdit(initialRule, onChange, onCancel, onRemove);

  const styles = {
    formControl: css({
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
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

  const controlWidth = 420;

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
                {
                  i18n[
                    rule.action.type === RuleActionType.BLOCK
                      ? "action_block"
                      : "action_allow"
                  ]
                }
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
        <VStack
          className="conditions"
          marginLeft="20px"
          alignItems="start"
          gap={isEditing ? 5 : 2}
        >
          {/* Request Domains */}
          <FormControl
            css={styles.formControl}
            isInvalid={validationErrors.requestDomains.length > 0}
          >
            <FormLabel css={styles.label}>{i18n["RequestDomains"]}</FormLabel>
            <InputDomains
              isEditing={isEditing}
              domains={rule.condition.requestDomains}
              onChange={updateRequestDomains}
              width={controlWidth}
              i18n={i18n}
            />
            <RequestDomainsHint marginLeft={2} />
            <FormErrorMessages
              messages={validationErrors.requestDomains}
              css={styles.note}
              width={controlWidth}
            />
          </FormControl>

          {/* Initiator Domains */}
          <FormControl
            css={styles.formControl}
            isInvalid={validationErrors.initiatorDomains.length > 0}
          >
            <FormLabel css={styles.label}>{i18n["InitiatorDomains"]}</FormLabel>
            <InputDomains
              isEditing={isEditing}
              domains={rule.condition.initiatorDomains}
              onChange={updateInitiatorDomains}
              width={controlWidth}
              i18n={i18n}
            />
            <InitiatorDomainsHint marginLeft={2} />
            <FormErrorMessages
              messages={validationErrors.initiatorDomains}
              css={styles.note}
              width={controlWidth}
            />
          </FormControl>

          {/* Request Methods */}
          <FormControl
            css={styles.formControl}
            isInvalid={validationErrors.requestMethods.length > 0}
          >
            <FormLabel css={styles.label}>{i18n["RequestMethods"]}</FormLabel>
            <InputRequestMethods
              isEditing={isEditing}
              requestMethods={rule.condition.requestMethods}
              onChange={updateRequestMethods}
              width={controlWidth}
              i18n={i18n}
            />
            <RequestMethodsHint marginLeft={2} />
          </FormControl>

          {/* URL Filter */}
          <Box>
            <FormControl
              css={styles.formControl}
              isInvalid={validationErrors.urlFilter.length > 0}
            >
              <FormLabel css={styles.label}>{i18n["URLFilter"]}</FormLabel>
              <InputUrlFilter
                isEditing={isEditing}
                urlFilter={rule.condition.urlFilter}
                onChange={updateUrlFilter}
                width={controlWidth}
                i18n={i18n}
              />
              {rule.condition.isRegexFilter ? (
                <URLFilterWithRegexHint marginLeft={2} />
              ) : (
                <URLFilterHint marginLeft={2} />
              )}
              <FormErrorMessages
                messages={validationErrors.urlFilter}
                css={styles.note}
                width={controlWidth}
                marginTop={1}
              />
            </FormControl>

            <Box css={styles.note}>
              <IsRegexFilter
                isEditing={isEditing}
                isRegexFilter={rule.condition.isRegexFilter}
                urlFilter={rule.condition.urlFilter}
                onChange={updateIsRegexFilter}
                i18n={i18n}
              />
            </Box>
          </Box>

          {/* Resource Types */}
          <FormControl
            css={styles.formControl}
            isInvalid={validationErrors.resourceTypes.length > 0}
          >
            <FormLabel css={styles.label}>{i18n["ResourceTypes"]}</FormLabel>
            <InputResourceTypes
              isEditing={isEditing}
              resourceTypes={rule.condition.resourceTypes}
              onChange={updateResourceTypes}
              width={controlWidth}
              i18n={i18n}
            />
            <ResourceTypesHint marginLeft={2} />
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
