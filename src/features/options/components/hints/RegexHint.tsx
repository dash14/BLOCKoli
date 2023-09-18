import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { HintPopover } from "@/components/parts/HintPopover";

export const RegexHint: React.FC = () => (
  <HintPopover title="Rules that use regex" width={500}>
    Regular expression to match against the network request url. This follows
    the{" "}
    <ExternalLink href="https://github.com/google/re2/wiki/Syntax">
      RE2 syntax
    </ExternalLink>
    .<Box marginTop={1}>Note:</Box>
    <UnorderedList marginLeft={5}>
      <ListItem>
        The regexFilter must be composed of only ASCII characters. This is
        matched against a url where the host is encoded in the punycode format
        (in case of internationalized domains) and any other non-ascii
        characters are url encoded in utf-8.
      </ListItem>
      <ListItem>
        The total number of regex rules of each type cannot exceed 1000.
      </ListItem>
      <ListItem>
        Each rule must be less than 2KB once compiled. This roughly correlates
        with the complexity of the rule. If you try to load a rule that exceeds
        this limit, you will see a warning like the one below and the rule will
        be ignored.
        <Box
          backgroundColor="#f3f3f3"
          borderRadius="4px"
          border="1px solid #ddd"
          padding="6px 10px"
        >
          rules_1.json: Rule with id 1 specified a more complext regex than
          allowed as part of the "regexFilter" key.
        </Box>
      </ListItem>
    </UnorderedList>
  </HintPopover>
);
