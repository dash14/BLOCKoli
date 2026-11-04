import { createRef } from "react";
import {
  Accordion,
  Button,
  HStack,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { LuPlus } from "react-icons/lu";
import { CSSTransition } from "react-transition-group";
import { EditableTitle } from "@/components/forms/EditableTitle";
import { AccordionCustomTrigger } from "@/components/parts/AccordionCustomTrigger";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { RulesEdit } from "@/features/options/components/rule/RulesEdit";
import {
  SaveRuleSets,
  useRuleSetsEdit,
} from "@/features/options/hooks/useRuleSetsEdit";
import { useI18n } from "@/hooks/useI18n";
import { countRules, MAX_RULES } from "@/modules/rules/limits";
import { StoredRuleSets } from "@/modules/rules/stored";
import { RuleLimitReached } from "../rule/RuleLimitReached";
import { RuleSetMenu } from "./RuleSetMenu";

type Props = {
  ruleSets: StoredRuleSets;
  titleFontAdjuster: number;
  save: SaveRuleSets;
};

const listTransitionCss = css(`
  display: flex;
  flex-direction: column;
  align-items: normal;
  margin-bottom: 16px;
  gap: 16px;
`);

export const RuleSetsEdit: React.FC<Props> = ({
  ruleSets,
  titleFontAdjuster,
  save,
}) => {
  const i18n = useI18n();

  const {
    entries,
    addRuleSet,
    addRule,
    saveNewRule,
    updateRule,
    removeRule,
    cancelNewRule,
    removeRuleSet,
    renameRuleSet,
  } = useRuleSetsEdit(ruleSets, save);

  // Includes new rules not saved yet, so adding stops at the limit
  const isAddAllowed = countRules(entries) < MAX_RULES;

  return (
    <>
      {entries.length > 0 ? (
        <Heading
          as="h2"
          fontSize={18 + titleFontAdjuster}
          fontWeight="normal"
          marginBottom={4}
        >
          {i18n["RuleSets"]}:
        </Heading>
      ) : (
        <Text fontSize={18 + titleFontAdjuster}>{i18n["empty_ruleset"]}</Text>
      )}

      <SlideTransitionGroup style={listTransitionCss}>
        {entries.map(({ id, name, rules, open }) => {
          const nodeRef = createRef<HTMLDivElement>();
          return (
            <CSSTransition
              key={id}
              timeout={250}
              classNames="slide"
              nodeRef={nodeRef}
            >
              <div ref={nodeRef}>
                <Accordion.Root
                  defaultValue={open ? ["0"] : []}
                  multiple
                  // Rules of a closed rule set are rendered only once it opens
                  lazyMount
                >
                  <Accordion.Item value="0" borderWidth="1px">
                    <AccordionCustomTrigger>
                      <EditableTitle
                        // Remount to show a name changed in another window
                        key={name}
                        defaultValue={name}
                        cursor="pointer"
                        flex="1"
                        onChange={(title) => renameRuleSet(id, title)}
                      />
                      <RuleSetMenu onRemove={() => removeRuleSet(id)} />
                      <Accordion.ItemIndicator />
                    </AccordionCustomTrigger>
                    <Accordion.ItemContent paddingX={6}>
                      <RulesEdit
                        rules={rules}
                        isAddAllowed={isAddAllowed}
                        onAdd={() => addRule(id)}
                        onSaveNew={(key, rule) => saveNewRule(id, key, rule)}
                        onUpdate={(ruleId, rule) => updateRule(id, ruleId, rule)}
                        onCancelNew={(key) => cancelNewRule(id, key)}
                        onRemove={(ruleId) => removeRule(id, ruleId)}
                      />
                    </Accordion.ItemContent>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
            </CSSTransition>
          );
        })}
      </SlideTransitionGroup>
      <HStack marginTop={4} gap={3}>
        <Button
          variant="outline"
          size="sm"
          disabled={!isAddAllowed}
          onClick={addRuleSet}
        >
          <Icon as={LuPlus} />
          {i18n["AddARuleSet"]}
        </Button>
        {!isAddAllowed && <RuleLimitReached />}
      </HStack>
    </>
  );
};
