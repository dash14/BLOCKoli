import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { RuleSetsEdit } from "@/features/options/components/ruleset/RuleSetsEdit";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { useI18n } from "../hooks/useI18n";

function Options() {
  const i18n = useI18n();

  const { loaded, enabled, changeState, ruleSets, updateRuleSets } =
    useRequestBlockClient();

  return (
    <>
      <Container
        maxW="960px"
        css={css({ visibility: loaded ? "visible" : "hidden" })}
      >
        <Box borderWidth="1px" borderRadius="lg" marginY="6" padding="8">
          <Heading as="h1" fontSize={28}>
            {i18n["Options"]}
          </Heading>

          <HStack marginY={10}>
            <Text fontSize={18} marginRight={10}>
              Enable blocking rules
            </Text>
            <Switch
              isChecked={enabled}
              onChange={(e) => changeState(e.target.checked)}
            />
          </HStack>

          <Heading as="h2" fontSize={18} fontWeight="normal" marginBottom={4}>
            Rule Sets:
          </Heading>

          <RuleSetsEdit ruleSets={ruleSets} onChange={updateRuleSets} />
        </Box>
      </Container>
    </>
  );
}

export default Options;
