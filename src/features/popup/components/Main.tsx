import { Box, HStack, IconButton, Switch, Text } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { MatchedRulesTable } from "@/features/popup/components/MatchedRulesTable";
import { ConfigureRulesLink } from "./ConfigureRulesLink";
import { MatchedRule, RuleSets } from "@/modules/core/rules";
import { useEffect, useState } from "react";
import { NoRules } from "./NoRules";

type Props = {
  isServiceEnabled: boolean;
  changeServiceState: (enabled: boolean) => void;
  ruleSets: RuleSets;
  getMatchedRule: () => Promise<MatchedRule[]>;
  optionsUrl: string;
};

export const Main: React.FC<Props> = ({
  isServiceEnabled,
  changeServiceState,
  ruleSets,
  getMatchedRule,
  optionsUrl,
}) => {
  const [matchedRules, setMatchedRules] = useState<MatchedRule[]>([]);

  const updateMatchedRules = () => {
    getMatchedRule().then((matchedRules) => {
      setMatchedRules(matchedRules);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(updateMatchedRules, []);

  return (
    <Box as="main" marginX="30px">
      {ruleSets.length === 0 ? (
        <NoRules optionsUrl={optionsUrl} />
      ) : (
        <>
          <HStack marginTop="20px" justifyContent="space-between">
            <Text fontSize={18}>Enable blocking rules</Text>
            <Switch
              isChecked={isServiceEnabled}
              onChange={(e) => changeServiceState(e.target.checked)}
            />
          </HStack>

          <Box marginTop="10px">
            <ConfigureRulesLink optionsUrl={optionsUrl} />
          </Box>

          {/* Table title */}
          <HStack marginTop="10px" justifyContent="space-between">
            <Text fontSize="14px">
              Matched rules in tabs (within 5 minutes)
            </Text>
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Refresh"
              variant="ghost"
              size="sm"
              color="black"
              onClick={updateMatchedRules}
            />
          </HStack>

          {/* Table */}
          <MatchedRulesTable matchedRules={matchedRules} height="110px" />
        </>
      )}
    </Box>
  );
};
