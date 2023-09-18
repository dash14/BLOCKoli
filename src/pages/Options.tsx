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
// import { useI18n } from "../hooks/useI18n";

function Options() {
  // const i18n = useI18n();

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
        <Text as="div">Notes:</Text>
        <UnorderedList>
          <ListItem>
            The network blocking and passing rules provided by this extension
            utilize the chrome.declarativeNetRequest API. As such, the
            limitations of this API still applied. See{" "}
            <ExternalLink href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#limits">
              Rules limits
            </ExternalLink>{" "}
            in the API reference for more information about the limits.
          </ListItem>
          <ListItem>
            Under no circumstances will the author of this extension,
            dash14.ack, is not responsible for any loss, damage or inconvenience
            caused by the use of this extension.
          </ListItem>
        </UnorderedList>
      </Container>

      <Container as="footer" textAlign="center" marginBottom={4}>
        <Copyright />
      </Container>
    </>
  );
}

export default Options;
