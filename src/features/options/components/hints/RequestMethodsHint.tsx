import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";

export const RequestMethodsHint: React.FC = () => (
  <HintPopover title="Request Methods" width={400}>
    List of HTTP request methods which the rule can match.
    <Box marginTop={1}>Note:</Box>
    <UnorderedList marginLeft={5}>
      <ListItem>
        Specifying a requestMethods rule condition will also exclude non-HTTP(s)
        requests.
      </ListItem>
    </UnorderedList>
  </HintPopover>
);
