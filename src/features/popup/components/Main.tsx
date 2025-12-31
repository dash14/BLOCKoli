import { useEffect, useState } from "react";
import { Box, HStack, IconButton, Switch, Text } from "@chakra-ui/react";
import { LuRefreshCw } from "react-icons/lu";
import { MatchedRulesTable } from "@/features/popup/components/MatchedRulesTable";
import { useI18n } from "@/hooks/useI18n";
import { RuleSets } from "@/modules/core/rules";
import { MatchedRule } from "@/modules/rules/matched";
import { ConfigureRulesLink } from "./ConfigureRulesLink";
import { NoRules } from "./NoRules";

type Props = {
  isServiceEnabled: boolean;
  changeServiceState: (enabled: boolean) => void;
  ruleSets: RuleSets;
  getMatchedRule: () => Promise<MatchedRule[]>;
  optionsUrl: string;
  titleFontAdjuster?: number;
};

export const Main: React.FC<Props> = ({
  isServiceEnabled,
  changeServiceState,
  ruleSets,
  getMatchedRule,
  optionsUrl,
  titleFontAdjuster = 0,
}) => {
  const i18n = useI18n();
  const [matchedRules, setMatchedRules] = useState<MatchedRule[]>([]);

  const updateMatchedRules = () => {
    getMatchedRule().then((matchedRules) => {
      setMatchedRules(matchedRules.reverse());
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
            <Text fontSize={18 + titleFontAdjuster}>{i18n["EnableRules"]}</Text>
            <Switch.Root
              checked={isServiceEnabled}
              onCheckedChange={(e) => changeServiceState(e.checked)}
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </HStack>

          <Box marginTop="10px">
            <ConfigureRulesLink
              optionsUrl={optionsUrl}
              fontSize={16 + titleFontAdjuster}
            />
          </Box>

          {/* Table title */}
          <HStack
            marginTop="10px"
            alignItems="baseline"
            justifyContent="space-between"
          >
            <Text fontSize={14 + titleFontAdjuster}>
              {i18n["MatchedRulesInTabs"]}
            </Text>
            <IconButton
              aria-label="Refresh"
              variant="ghost"
              size="sm"
              color="black"
              onClick={updateMatchedRules}
            >
              <LuRefreshCw />
            </IconButton>
          </HStack>

          {/* Table */}
          <MatchedRulesTable matchedRules={matchedRules} height="110px" />
        </>
      )}
    </Box>
  );
};
