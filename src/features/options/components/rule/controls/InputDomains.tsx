import { useEffect, useState } from "react";
import { Input } from "@chakra-ui/react";
import { Tags } from "@/components/parts/Tags";
import { I18nMessageMap } from "@/hooks/useI18n";
import { unique } from "@/modules/utils/unique";

type Props = {
  isEditing: boolean;
  domains?: string[] | undefined;
  onChange: (value: string[]) => void;
  width: number;
  maxWidth: number;
  i18n: I18nMessageMap;
};

export const InputDomains: React.FC<Props> = ({
  isEditing,
  domains,
  onChange,
  width,
  maxWidth,
  i18n,
}) => {
  const [domainsText, setDomainsText] = useState(domains?.join(",") ?? "");

  useEffect(() => {
    const text = domains?.join(",") ?? "";
    if (isEditing && domainsText !== text) {
      setDomainsText(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  function updateDomains(text: string) {
    setDomainsText(text);
    const domains = text
      .split(",")
      .map((text) => text.trim())
      .filter(Boolean);
    onChange(unique(domains));
  }

  return isEditing ? (
    <Input
      value={domainsText}
      onChange={(e) => updateDomains(e.target.value)}
      variant="outline"
      placeholder="www.example.com, ..."
      width={width}
    />
  ) : (
    <Tags
      empty={i18n["NotSpecified"]}
      values={domains ?? []}
      maxWidth={maxWidth}
      marginTop="2px"
    />
  );
};
