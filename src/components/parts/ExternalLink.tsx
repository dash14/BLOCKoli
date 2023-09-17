import { ReactNode } from "react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/react";

type Props = {
  href: string;
  children: ReactNode;
};

export const ExternalLink: React.FC<Props> = ({ href, children }) => {
  return (
    <Link href={href} target="_blank" rel="noopener" color="blue.500">
      {children}
      <ExternalLinkIcon mx="2px" />
    </Link>
  );
};
