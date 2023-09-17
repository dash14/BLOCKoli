import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { Brand } from "@/components/parts/Brand";
import { BrandIcon } from "@/components/parts/BrandIcon";
import { RuleSetsEdit } from "@/features/options/components/ruleset/RuleSetsEdit";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { useI18n } from "../hooks/useI18n";

function Options() {
  const i18n = useI18n();

  const { loaded, enabled, changeState, ruleSets, updateRuleSets } =
    useRequestBlockClient();

  return (
    <>
      <HStack
        as="header"
        backgroundColor="#f6ffe7"
        borderBottom="1px solid #d6dFc7"
        padding="14px 24px"
        alignItems="center"
      >
        <BrandIcon marginRight="2px" />
        <Brand as="h1" fontSize={28} />
      </HStack>
      <Container
        maxW="960px"
        css={css({ visibility: loaded ? "visible" : "hidden" })}
      >
        <Box borderWidth="1px" borderRadius="lg" marginY="6" padding="8">
          <Heading as="h1" fontSize={28}>
            Options
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
