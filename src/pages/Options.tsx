import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
  UnorderedList,
  ListItem,
  Select,
} from "@chakra-ui/react";
import { css, Global } from "@emotion/react";
import { Brand } from "@/components/brand/Brand";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Copyright } from "@/components/brand/Copyright";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { RuleSetsEdit } from "@/features/options/components/ruleset/RuleSetsEdit";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { useTitleFontAdjuster } from "@/hooks/useTitleFontAdjuster";
import { useI18n } from "../hooks/useI18n";

const Options: React.FC = () => {
  const i18n = useI18n();

  const {
    loaded,
    enabled,
    changeState,
    ruleSets,
    updateRuleSets,
    language,
    setLanguage,
  } = useRequestBlockClient();

  const { titleFontAdjuster } = useTitleFontAdjuster(language);

  // To prevent flickering when displaying pages,
  // fade and turn off all transitions until loaded.
  const globalStyle = css`
    .options {
      transition: opacity 0.2s linear;
      opacity: 1;
    }
    .options.loading {
      opacity: 0;
    }
    .options.loading * {
      transition: none;
    }
  `;

  return (
    <Box className={`options ${language}${loaded ? "" : " loading"}`}>
      <Global styles={globalStyle} />
      <HStack
        as="header"
        backgroundColor="#f6ffe7"
        borderBottom="1px solid #d6dFc7"
        padding="8px 24px"
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack>
          <BrandIcon marginRight="4px" />
          <Brand as="h1" fontSize={36} />
        </HStack>
        <Select
          size="xs"
          variant="outline"
          borderColor="#C4D3AB"
          width={110}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ja">日本語 (ja)</option>
        </Select>
      </HStack>
      <Container
        width="930px"
        minW="930px"
        maxW="100%"
        borderWidth="1px"
        borderRadius="lg"
        marginY={6}
        padding={8}
        css={css({ visibility: loaded ? "visible" : "hidden" })}
      >
        <Heading as="h1" fontSize={28}>
          {i18n["Options"]}
        </Heading>

        <HStack marginY={10}>
          <Text fontSize={18 + titleFontAdjuster} marginRight={10}>
            {i18n["EnableRules"]}
          </Text>
          <Switch
            isChecked={enabled}
            onChange={(e) => changeState(e.target.checked)}
          />
        </HStack>

        <RuleSetsEdit
          ruleSets={ruleSets}
          titleFontAdjuster={titleFontAdjuster}
          onChange={updateRuleSets}
        />
      </Container>

      <Container
        width="930px"
        minW="930px"
        maxW="100%"
        marginY={4}
        color="#444"
        backgroundColor="#edf2f7"
        border="1px solid #edf2f7"
        fontSize={14}
        paddingX={4}
        paddingY={2}
        borderRadius="lg"
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
    </Box>
  );
};

export default Options;
