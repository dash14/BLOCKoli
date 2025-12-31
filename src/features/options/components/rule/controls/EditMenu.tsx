import { Button, Icon, Tag } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";
import { I18nMessageMap } from "@/hooks/useI18n";
import { RuleMenu } from "../RuleMenu";

type Props = {
  isEditing: boolean;
  isRemoveEnabled: boolean;
  onClickEdit: () => void;
  onClickRemove: () => void;
  i18n: I18nMessageMap;
};

export const EditMenu: React.FC<Props> = ({
  isEditing,
  isRemoveEnabled,
  onClickEdit,
  onClickRemove,
  i18n,
}) => {
  return isEditing ? (
    <Tag.Root size="sm" colorPalette="blue">
      <Tag.Label>{i18n["Editing"]}</Tag.Label>
    </Tag.Root>
  ) : (
    <>
      <Button variant="ghost" size="sm" onClick={onClickEdit}>
        <Icon as={LuPencil} />
        {i18n["Edit"]}
      </Button>
      {isRemoveEnabled && <RuleMenu onRemove={onClickRemove} />}
    </>
  );
};
