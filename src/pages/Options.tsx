import {
  Container,
  Box,
  Grid,
  GridItem,
  Switch,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { Input, InputGroup } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Stack, Radio, RadioGroup } from "@chakra-ui/react";
import { useI18n } from "../hooks/useI18n";

function Options() {
  const i18n = useI18n();
  return (
    <>
      <Container maxW="960px">
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          marginY="6"
          padding="8"
        >
          <h1>{i18n["Options"]}</h1>

          <Grid templateColumns="repeat(2, 1fr)" width="fit-content" gap={20}>
            <GridItem>ルールを適用する</GridItem>
            <GridItem>
              <Switch />
            </GridItem>
          </Grid>

          <h2>ルールセットの一覧</h2>
          <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
              <h3>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <InputGroup onClick={(e) => e.preventDefault()}>
                      <Input size="md" htmlSize={10} value="RuleSet 1" />
                      <InputRightElement>
                        <Button variant="ghost" size="sm">
                          <CheckIcon color="green.500" />
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h3>
              <AccordionPanel pb={4}>
                <Box>
                  <h4>アクション</h4>
                  <Box marginLeft="20px">
                    <RadioGroup>
                      <Stack direction="row">
                        <Radio value="block" colorScheme="red">
                          block
                        </Radio>
                        <Radio value="allow" colorScheme="green">
                          allow
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </Box>
                  <h4>条件</h4>
                  <Box marginLeft="20px"></Box>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Container>
    </>
  );
}

export default Options;
