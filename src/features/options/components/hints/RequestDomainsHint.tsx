import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";

export const RequestDomainsHint: React.FC = () => (
  <HintPopover title="Request Domains" width={400}>
    Specify the domains in the request url as a comma-separated list.
    <br />
    The rule will only match network requests when the domain matches one from
    this list. If the list is omitted, the rule is applied to requests from all
    domains.
    <Box marginTop={1}>Note:</Box>
    <UnorderedList marginLeft={5}>
      <ListItem>Sub-domains like "a.example.com" are also allowed.</ListItem>
      <ListItem>The entries must consist of only ascii characters.</ListItem>
      <ListItem>Use punycode encoding for internationalized domains.</ListItem>
      <ListItem>Sub-domains of the listed domains are also matched.</ListItem>
    </UnorderedList>
  </HintPopover>
);
