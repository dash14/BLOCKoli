import { Box, HTMLChakraProps, Icon, Table } from "@chakra-ui/react";
import { LuBan, LuCircleCheckBig, LuCircleHelp } from "react-icons/lu";
import { useI18n } from "@/hooks/useI18n";
import { MatchedRule } from "@/modules/rules/matched";

type Props = {
  matchedRules: MatchedRule[];
} & Omit<HTMLChakraProps<"div">, "css">;

export const MatchedRulesTable: React.FC<Props> = ({
  matchedRules,
  ...props
}) => {
  const i18n = useI18n();
  return (
    <Box overflowY="auto" border="1px solid #ccc" borderRadius="6px" {...props}>
      <Table.ScrollArea overflowX="unset" overflowY="unset">
        <Table.Root variant="outline" size="sm" fontSize="12px">
          <Table.Header
            position="sticky"
            top="0"
            zIndex="docked"
            backgroundColor="#eee"
          >
            <Table.Row>
              <Table.ColumnHeader
                width="90px"
                textTransform="none"
                paddingTop="2px"
                paddingBottom="2px"
                paddingLeft="10px"
                paddingRight="6px"
              >
                {i18n["table_MatchedRules_column_timestamp"]}
              </Table.ColumnHeader>
              <Table.ColumnHeader
                textTransform="none"
                paddingTop="0"
                paddingBottom="2px"
              >
                {i18n["table_MatchedRules_column_rule"]}
              </Table.ColumnHeader>
              <Table.ColumnHeader
                width="20px"
                paddingTop="0"
                paddingBottom="2px"
                paddingLeft="6px"
                paddingRight="10px"
              >
                <Icon as={LuCircleHelp} />
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {matchedRules.map((rule, i) => (
              <Table.Row key={i}>
                <Table.Cell
                  width="90px"
                  fontSize="12px"
                  paddingY="4px"
                  paddingRight="6px"
                >
                  {new Date(rule.timeStamp).toLocaleTimeString()}
                </Table.Cell>
                <Table.Cell
                  fontSize="12px"
                  paddingY="4px"
                  overflowX="hidden"
                  textOverflow="ellipsis"
                  title={`${rule.rule.ruleSetName} #${rule.rule.number}`}
                >
                  {`${rule.rule.ruleSetName} #${rule.rule.number}`}
                </Table.Cell>
                <Table.Cell width="20px" paddingLeft="6px" paddingRight="10px">
                  {rule.rule ? (
                    rule.rule.isBlocking ? (
                      <Icon as={LuBan} color="red" />
                    ) : (
                      <Icon as={LuCircleCheckBig} color="green" />
                    )
                  ) : (
                    <Icon as={LuCircleHelp} color="blue.500" />
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
};
