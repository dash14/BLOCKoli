import { ReactNode } from "react";
import { Icon, Link } from "@chakra-ui/react";
import { LuExternalLink } from "react-icons/lu";

type Props = {
  href: string;
  children: ReactNode;
};

export const ExternalLink: React.FC<Props> = ({ href, children }) => {
  return (
    <Link href={href} target="_blank" rel="noopener" color="blue.500">
      {children}
      <Icon as={LuExternalLink} mx="2px" />
    </Link>
  );
};
