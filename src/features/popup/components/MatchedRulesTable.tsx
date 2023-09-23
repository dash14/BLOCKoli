import {
  CheckCircleIcon,
  NotAllowedIcon,
  QuestionOutlineIcon,
} from "@chakra-ui/icons";
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
import { useI18n } from "@/hooks/useI18n";
import { MatchedRule } from "@/modules/core/rules";

type Props = {
  matchedRules: MatchedRule[];
} & ChakraProps;

export const MatchedRulesTable: React.FC<Props> = ({
  matchedRules,
  ...props
}) => {
  const i18n = useI18n();
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
              <Th
                width="90px"
                textTransform="none"
                paddingLeft="10px"
                paddingRight="6px"
              >
                {i18n["table_MatchedRules_column_timestamp"]}
              </Th>
              <Th textTransform="none">
                {i18n["table_MatchedRules_column_rule"]}
              </Th>
              <Th width="20px" paddingLeft="6px" paddingRight="10px">
                <QuestionOutlineIcon />
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {matchedRules.map((rule, i) => (
              <Tr key={i}>
                <Td
                  width="90px"
                  fontSize="12px"
                  paddingY="4px"
                  paddingRight="6px"
                >
                  {new Date(rule.timeStamp).toLocaleTimeString()}
                </Td>
                <Td
                  fontSize="12px"
                  paddingY="4px"
                  overflowX="hidden"
                  textOverflow="ellipsis"
                  title={`${rule.rule.ruleSetName} #${rule.rule.number}`}
                >
                  {`${rule.rule.ruleSetName} #${rule.rule.number}`}
                </Td>
                <Td width="20px" paddingLeft="6px" paddingRight="10px">
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
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
