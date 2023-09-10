import { SerializedStyles, css } from "@emotion/react";
import { ReactNode } from "react";
import { TransitionGroup } from "react-transition-group";

type Props = {
  style?: SerializedStyles;
  children: ReactNode;
};

const listTransitionCss = css(`
.slide-enter {
  opacity: 0;
  max-height: 0;
}
.slide-enter-active {
  opacity: 1;
  max-height: 1000px;
  transition: all 250ms linear;
}
.slide-exit {
  opacity: 1;
  max-height: 1000px;
}
.slide-exit-active {
  opacity: 0;
  max-height: 0;
  transition: all 250ms linear;
}
`);

export const SlideTransitionGroup: React.FC<Props> = ({ style, children }) => {
  return (
    <TransitionGroup
      css={style ? [listTransitionCss, style] : listTransitionCss}
    >
      {children}
    </TransitionGroup>
  );
};
