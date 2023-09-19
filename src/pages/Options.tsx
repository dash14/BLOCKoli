import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { Brand } from "@/components/brand/Brand";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Copyright } from "@/components/brand/Copyright";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { RuleSetsEdit } from "@/features/options/components/ruleset/RuleSetsEdit";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { useI18n } from "../hooks/useI18n";

const Options: React.FC = () => {
  const i18n = useI18n();

  const { loaded, enabled, changeState, ruleSets, updateRuleSets } =
    useRequestBlockClient();

  return (
    <>
      <HStack
        as="header"
        backgroundColor="#f6ffe7"
        borderBottom="1px solid #d6dFc7"
        padding="8px 24px"
        alignItems="center"
      >
        <BrandIcon marginRight="4px" />
        <Brand as="h1" fontSize={36} />
      </HStack>
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
              {i18n["EnableRules"]}
            </Text>
            <Switch
              isChecked={enabled}
              onChange={(e) => changeState(e.target.checked)}
            />
          </HStack>

          <Heading as="h2" fontSize={18} fontWeight="normal" marginBottom={4}>
            {i18n["RuleSets"]}:
          </Heading>

          <RuleSetsEdit ruleSets={ruleSets} onChange={updateRuleSets} />
        </Box>
      </Container>

      <Container
        maxW="930px"
        marginY={4}
        color="#444"
        backgroundColor="#edf2f7"
        fontSize={14}
        paddingX={4}
        paddingY={2}
        borderRadius="0.5rem"
      >
        <Text as="div">{i18n["Notice"]}:</Text>
        <UnorderedList>
          <ListItem>
            {i18n["notice1_1"]}{" "}
            <ExternalLink href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#limits">
              Rules limits
            </ExternalLink>{" "}
            {i18n["notice1_2"]}
          </ListItem>
          <ListItem>{i18n["notice_2"]}</ListItem>
        </UnorderedList>
      </Container>

      <Container as="footer" textAlign="center" marginBottom={4}>
        <Copyright />
      </Container>
    </>
  );
};

export default Options;
