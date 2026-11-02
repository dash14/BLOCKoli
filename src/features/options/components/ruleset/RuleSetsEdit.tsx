import { createRef } from "react";
import {
  Accordion,
  Box,
  Button,
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
import { useRuleSetsEdit } from "@/features/options/hooks/useRuleSetsEdit";
import { useI18n } from "@/hooks/useI18n";
import { StoredRuleSets } from "@/modules/rules/stored";
import { RuleSetMenu } from "./RuleSetMenu";

type Props = {
  ruleSets: StoredRuleSets;
  titleFontAdjuster: number;
  onChange: (ruleSets: StoredRuleSets) => void;
};

const listTransitionCss = css(`
  display: flex;
  flex-direction: column;
  align-items: normal;
  margin-bottom: 16px;
  gap: 16px;
`);

export const RuleSetsEdit: React.FC<Props> = ({
  ruleSets: originalRuleSets,
  titleFontAdjuster,
  onChange,
}) => {
  const i18n = useI18n();

  const {
    entries,
    addRuleSet,
    updateRules,
    removeRuleSet,
    updateRuleSetTitle,
  } = useRuleSetsEdit(originalRuleSets, onChange);

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
        {entries.map(({ key, ruleSet, open }, ruleSetIndex) => {
          const nodeRef = createRef<HTMLDivElement>();
          return (
            <CSSTransition
              key={key}
              timeout={250}
              classNames="slide"
              nodeRef={nodeRef}
            >
              <div ref={nodeRef}>
                <Accordion.Root
                  defaultValue={open ? ["0"] : []}
                  multiple
                >
                  <Accordion.Item value="0" borderWidth="1px">
                    <AccordionCustomTrigger>
                      <EditableTitle
                        // Remount to show a name changed in another window
                        key={ruleSet.name}
                        defaultValue={ruleSet.name}
                        cursor="pointer"
                        flex="1"
                        onChange={(title) =>
                          updateRuleSetTitle(title, ruleSetIndex)
                        }
                      />
                      <RuleSetMenu
                        onRemove={() => removeRuleSet(ruleSetIndex)}
                      />
                      <Accordion.ItemIndicator />
                    </AccordionCustomTrigger>
                    <Accordion.ItemContent paddingX={6}>
                      <RulesEdit
                        rules={ruleSet.rules}
                        onChange={(rules) => updateRules(rules, ruleSetIndex)}
                      />
                    </Accordion.ItemContent>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
            </CSSTransition>
          );
        })}
      </SlideTransitionGroup>
      <Box marginTop={4}>
        <Button variant="outline" size="sm" onClick={addRuleSet}>
          <Icon as={LuPlus} />
          {i18n["AddARuleSet"]}
        </Button>
      </Box>
    </>
  );
};
