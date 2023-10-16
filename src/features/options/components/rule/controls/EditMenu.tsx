import { Button } from "@chakra-ui/button";
import { EditIcon } from "@chakra-ui/icons";
import { Tag } from "@chakra-ui/tag";
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
    <Tag size="sm" backgroundColor="blue.500" color="white">
      {i18n["Editing"]}
    </Tag>
  ) : (
    <>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<EditIcon />}
        onClick={onClickEdit}
      >
        {i18n["Edit"]}
      </Button>
      {isRemoveEnabled && <RuleMenu onRemove={onClickRemove} />}
    </>
  );
};
