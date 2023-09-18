import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";

export const InitiatorDomainsHint: React.FC = () => (
  <HintPopover title="Initiator Domains" width={400}>
    The rule will only match network requests originating from the list of
    initiator domains. If the list is empty, the rule is applied to requests
    from all domains.
    <Box marginTop={1}>Note:</Box>
    <UnorderedList marginLeft={5}>
      <ListItem>Sub-domains like "a.example.com" are also allowed.</ListItem>
      <ListItem>The entries must consist of only ascii characters.</ListItem>
      <ListItem>Use punycode encoding for internationalized domains.</ListItem>
      <ListItem>
        This matches against the request initiator and not the request url.
      </ListItem>
      <ListItem>Sub-domains of the listed domains are also matched.</ListItem>
    </UnorderedList>
  </HintPopover>
);
