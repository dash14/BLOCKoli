import { createRef } from "react";
import { css } from "@emotion/react";
import { CSSTransition } from "react-transition-group";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { SlideTransitionGroup } from "./SlideTransitionGroup";

describe("SlideTransitionGroup component", () => {
  test("renders children without custom style", async () => {
    const nodeRef = createRef<HTMLDivElement>();
    await renderWithChakra(
      <SlideTransitionGroup>
        <CSSTransition nodeRef={nodeRef} timeout={250} classNames="slide">
          <div ref={nodeRef}>Test Content</div>
        </CSSTransition>
      </SlideTransitionGroup>
    );

    await expect.element(page.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders children with custom style", async () => {
    const nodeRef = createRef<HTMLDivElement>();
    const customStyle = css`
      margin-top: 10px;
    `;

    await renderWithChakra(
      <SlideTransitionGroup style={customStyle}>
        <CSSTransition nodeRef={nodeRef} timeout={250} classNames="slide">
          <div ref={nodeRef}>Styled Content</div>
        </CSSTransition>
      </SlideTransitionGroup>
    );

    await expect.element(page.getByText("Styled Content")).toBeInTheDocument();
  });
});
