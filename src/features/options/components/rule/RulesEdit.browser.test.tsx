import { useState } from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleActionType } from "@/modules/core/rules";
import { RULE_ID_UNSAVED, StoredRule } from "@/modules/rules/stored";
import { renderWithChakra } from "@/test/utils/render";
import { RulesEdit } from "./RulesEdit";

// 状態管理を行うラッパーコンポーネント（controlled componentのテスト用）
function StatefulRulesEdit({
  initialRules,
  onChangeCapture,
  testId,
}: {
  initialRules: StoredRule[];
  onChangeCapture?: (rules: StoredRule[]) => void;
  testId?: string;
}) {
  const [rules, setRules] = useState(initialRules);
  const handleChange = (newRules: StoredRule[]) => {
    setRules(newRules);
    onChangeCapture?.(newRules);
  };
  return (
    <div data-testid={testId}>
      <RulesEdit rules={rules} onChange={handleChange} />
    </div>
  );
}

// テスト用の有効なルール（複数）
const twoRules: StoredRule[] = [
  {
    id: 1,
    action: { type: RuleActionType.BLOCK },
    condition: { requestDomains: ["example.com"] },
  },
  {
    id: 2,
    action: { type: RuleActionType.ALLOW },
    condition: { initiatorDomains: ["trusted.com"] },
  },
];

// テスト用の単一ルール
const singleRule: StoredRule[] = [
  {
    id: 1,
    action: { type: RuleActionType.BLOCK },
    condition: { requestDomains: ["example.com"], urlFilter: "*ads*" },
  },
];

// テスト用の単一ルール（シンプル）
const simpleRule: StoredRule[] = [
  {
    id: 1,
    action: { type: RuleActionType.BLOCK },
    condition: { requestDomains: ["example.com"] },
  },
];

describe("RulesEdit component", () => {
  beforeAll(async () => {
    await page.viewport(800, 900);
  });

  describe("初期表示", () => {
    test("複数ルールがリスト表示される", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RulesEdit rules={twoRules} onChange={() => {}} />
        </div>
      );

      // 各ルールのアクションタイプが表示される
      await expect
        .element(page.getByText("block", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(page.getByText("allow", { exact: true }))
        .toBeInTheDocument();

      // 各ルールの条件が表示される
      await expect
        .element(page.getByText("example.com", { exact: true }))
        .toBeInTheDocument();
      await expect.element(page.getByText("trusted.com")).toBeInTheDocument();

      // Add a Ruleボタンが表示される
      await expect
        .element(page.getByRole("button", { name: /add a rule/i }))
        .toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RulesEdit-two-rules"
      );
    });

    test("単一ルールの場合、削除ボタンが無効", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RulesEdit rules={simpleRule} onChange={() => {}} />
        </div>
      );

      // ルールが表示される
      await expect
        .element(page.getByText("example.com", { exact: true }))
        .toBeInTheDocument();

      // Editボタンをクリックして編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // Removeボタンが表示されない（isRemoveEnabled=false）
      await expect
        .element(page.getByRole("button", { name: /remove/i }))
        .not.toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RulesEdit-single-rule-edit"
      );
    });
  });

  describe("ルール追加", () => {
    test("Add a Ruleボタンで新規ルールが追加される", async () => {
      await renderWithChakra(
        <StatefulRulesEdit initialRules={simpleRule} testId="container" />
      );

      // Add a Ruleボタンをクリック
      await page.getByRole("button", { name: /add a rule/i }).click();

      // 新規ルールが編集モードで追加される（Editingタグが表示）
      await expect.element(page.getByText("Editing")).toBeInTheDocument();

      // Add a Ruleボタンが非表示になる（編集中は追加不可）
      await expect
        .element(page.getByRole("button", { name: /add a rule/i }))
        .not.toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RulesEdit-add-rule"
      );
    });

    test("新規ルールを保存するとonChangeが呼ばれる", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRulesEdit
          initialRules={simpleRule}
          onChangeCapture={onChangeCapture}
        />
      );

      // Add a Ruleボタンをクリック
      await page.getByRole("button", { name: /add a rule/i }).click();

      // 新規ルールが編集モードで追加される
      await expect.element(page.getByText("Editing")).toBeInTheDocument();

      // 条件を入力（新規ルールのrequestDomainsフィールド）
      // 既存ルール(simpleRule)はビューモードなのでtextboxなし
      // 新規ルールのtextboxは0番目から始まる
      const newRuleRequestDomains = page.getByRole("textbox").nth(0);
      await newRuleRequestDomains.fill("newdomain.com");

      // Saveボタンをクリック
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeCaptureが呼ばれる（最後の呼び出しが保存後）
      expect(onChangeCapture).toHaveBeenCalled();
      const lastCall =
        onChangeCapture.mock.calls[onChangeCapture.mock.calls.length - 1];
      const newRules = lastCall?.[0] as StoredRule[];
      expect(newRules).toHaveLength(2);
      // 新規ルールのIDはRULE_ID_UNSAVED (0)
      expect(newRules[1].id).toBe(RULE_ID_UNSAVED);
      expect(newRules[1].condition.requestDomains).toContain("newdomain.com");
    });
  });

  describe("ルール編集", () => {
    test("既存ルールを編集してSaveするとonChangeが呼ばれる", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <RulesEdit rules={singleRule} onChange={onChange} />
      );

      // Editボタンをクリック
      await page.getByRole("button", { name: /edit/i }).click();

      // 編集モードになる
      await expect.element(page.getByText("Editing")).toBeInTheDocument();

      // urlFilterを変更（3番目のtextbox）
      const urlFilterInput = page.getByRole("textbox").nth(2);
      await urlFilterInput.clear();
      await urlFilterInput.fill("||tracking.com^");

      // Saveボタンをクリック
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalled();
      const updatedRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(updatedRules[0].condition.urlFilter).toBe("||tracking.com^");
    });
  });

  describe("ルール削除", () => {
    test("複数ルールの場合、ルールを削除できる", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <RulesEdit rules={twoRules} onChange={onChange} />
      );

      // 最初のルールのメニューボタンをクリック
      const menuButtons = page.getByRole("button", { name: "more" });
      await menuButtons.nth(0).click();

      // Removeメニュー項目をクリック
      await page.getByRole("menuitem", { name: /remove/i }).click();

      // 確認ダイアログが表示される
      await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

      // ダイアログ内のRemoveボタンをクリック
      const dialogRemoveButton = page
        .getByRole("alertdialog")
        .getByRole("button", { name: /remove/i });
      await dialogRemoveButton.click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalled();
      const remainingRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(remainingRules).toHaveLength(1);
      // 2番目のルールのみ残る
      expect(remainingRules[0].id).toBe(2);
    });
  });

  describe("キャンセル操作", () => {
    test("新規ルール編集中にCancelでルールが削除される", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRulesEdit
          initialRules={simpleRule}
          onChangeCapture={onChangeCapture}
        />
      );

      // Add a Ruleボタンをクリック
      await page.getByRole("button", { name: /add a rule/i }).click();

      // 新規ルールが追加される（Saveボタンで編集モードを確認）
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeInTheDocument();

      // Cancelボタンをクリック
      await page.getByRole("button", { name: /cancel/i }).click();

      // Add a Ruleボタンが再表示される（キャンセルで新規ルールが削除された）
      await expect
        .element(page.getByRole("button", { name: /add a rule/i }))
        .toBeInTheDocument();

      // 最後のonChangeCapture呼び出しでルールが1件に戻っている
      const lastCall =
        onChangeCapture.mock.calls[onChangeCapture.mock.calls.length - 1];
      const rules = lastCall?.[0] as StoredRule[];
      expect(rules).toHaveLength(1);
    });

    test("既存ルール編集中にCancelで変更が破棄される", async () => {
      await renderWithChakra(
        <RulesEdit rules={singleRule} onChange={() => {}} />
      );

      // Editボタンをクリック
      await page.getByRole("button", { name: /edit/i }).click();

      // urlFilterを変更（singleRuleはurlFilterを持つので、3番目のtextbox）
      const urlFilterInput = page.getByRole("textbox").nth(2);
      await urlFilterInput.clear();
      await urlFilterInput.fill("changed-filter");

      // Cancelボタンをクリック
      await page.getByRole("button", { name: /cancel/i }).click();

      // ビューモードに戻り、元の値が表示される（変更は破棄される）
      await expect.element(page.getByText("*ads*")).toBeInTheDocument();
    });
  });

  describe("複数ルールの操作", () => {
    test("2番目のルールを編集できる", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <RulesEdit rules={twoRules} onChange={onChange} />
      );

      // 2番目のルールのEditボタンをクリック
      const editButtons = page.getByRole("button", { name: /edit/i });
      await editButtons.nth(1).click();

      // 2番目のルールが編集モードになる（Saveボタンで確認）
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeInTheDocument();

      // initiatorDomainsを変更
      // ビューモードではtextboxなし、編集中のルールのみtextboxが表示される
      // 2番目のルール（編集中）: requestDomains[0], initiatorDomains[1], urlFilter[2]
      const initiatorDomainsInput = page.getByRole("textbox").nth(1);
      await initiatorDomainsInput.clear();
      await initiatorDomainsInput.fill("updated.com");

      // Saveボタンをクリック
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalled();
      const updatedRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(updatedRules[1].condition.initiatorDomains).toContain(
        "updated.com"
      );
    });
  });
});
