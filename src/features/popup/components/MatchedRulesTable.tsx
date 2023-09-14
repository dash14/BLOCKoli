import {
  Box,
  ChakraProps,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { MatchedRule } from "@/modules/clients/PopupController";
import {
  CheckCircleIcon,
  NotAllowedIcon,
  QuestionOutlineIcon,
} from "@chakra-ui/icons";

type Props = {
  matchedRules: MatchedRule[];
} & ChakraProps;

export const MatchedRulesTable: React.FC<Props> = ({
  matchedRules,
  ...props
}) => {
  return (
    <Box overflowY="auto" border="1px solid #ccc" borderRadius="6px" {...props}>
      <TableContainer overflowX="unset" overflowY="unset">
        <Table variant="simple" size="sm">
          <Thead
            position="sticky"
            top="0"
            zIndex="docked"
            backgroundColor="#eee"
          >
            <Tr>
              <Th width="20px" paddingLeft="10px" paddingRight="6px">
                <QuestionOutlineIcon />
              </Th>
              <Th textTransform="none">timestamp</Th>
              <Th textTransform="none">rule</Th>
            </Tr>
          </Thead>
          <Tbody>
            {matchedRules.map((rule, i) => (
              <Tr key={i}>
                <Td width="20px" paddingLeft="10px" paddingRight="6px">
                  {rule.rule ? (
                    rule.rule.isBlocking ? (
                      <NotAllowedIcon color="red" />
                    ) : (
                      <CheckCircleIcon color="green" />
                    )
                  ) : (
                    <QuestionOutlineIcon color="blue.500" />
                  )}
                </Td>
                <Td fontSize="12px" paddingY="4px">
                  {rule.timeStamp.toLocaleTimeString()}
                </Td>
                <Td
                  fontSize="12px"
                  paddingY="4px"
                  overflowX="hidden"
                  textOverflow="ellipsis"
                  title={
                    rule.rule
                      ? `${rule.rule.ruleSetName} #${rule.rule.number}`
                      : "unknown"
                  }
                >
                  {rule.rule
                    ? `${rule.rule.ruleSetName} #${rule.rule.number}`
                    : "unknown"}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
