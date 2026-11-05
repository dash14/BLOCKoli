import { useState } from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleEntry } from "@/features/options/hooks/useRuleSetsEdit";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { StoredRule } from "@/modules/rules/stored";
import { newRuleTemplate } from "@/modules/rules/template";
import { renderWithChakra } from "@/test/utils/render";
import { RulesEdit } from "./RulesEdit";

const entries = (rules: StoredRule[]): RuleEntry[] =>
  rules.map((rule) => ({ key: `rule-${rule.id}`, rule, id: rule.id }));

const handlers = () => ({
  onAdd: vi.fn(),
  onSaveNew: vi.fn(async () => true),
  onUpdate: vi.fn(async () => true),
  onCancelNew: vi.fn(),
  onRemove: vi.fn(),
});

// 親の代わりに、追加中のルールと保存を受け持つラッパー
function StatefulRulesEdit({
  initialRules,
  onSaveNew,
  testId,
}: {
  initialRules: StoredRule[];
  onSaveNew?: (key: string, rule: Rule) => void;
  testId?: string;
}) {
  const [rules, setRules] = useState(entries(initialRules));
  return (
    <div data-testid={testId}>
      <RulesEdit
        rules={rules}
        isAddAllowed
        onAdd={() => setRules([...rules, { key: "new", rule: newRuleTemplate }])}
        onSaveNew={async (key, rule) => {
          onSaveNew?.(key, rule);
          setRules(rules.map((entry) => (entry.key === key ? { key, rule, id: 99 } : entry)));
          return true;
        }}
        onUpdate={async () => true}
        onCancelNew={(key) => setRules(rules.filter((entry) => entry.key !== key))}
        onRemove={() => {}}
      />
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
          <RulesEdit rules={entries(twoRules)} isAddAllowed {...handlers()} />
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
          <RulesEdit rules={entries(simpleRule)} isAddAllowed {...handlers()} />
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

    test("新規ルールを保存するとonSaveNewが呼ばれる", async () => {
      const onSaveNew = vi.fn();
      await renderWithChakra(
        <StatefulRulesEdit initialRules={simpleRule} onSaveNew={onSaveNew} />
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

      // 追加中のルールのkeyと入力した内容で呼ばれる
      await expect.poll(() => onSaveNew.mock.calls.length).toBe(1);
      const [key, rule] = onSaveNew.mock.calls[0];
      expect(key).toBe("new");
      expect(rule.condition.requestDomains).toEqual(["newdomain.com"]);

      // 保存後は表示モードに戻り、また追加できる
      await expect
        .element(page.getByRole("button", { name: /add a rule/i }))
        .toBeInTheDocument();
    });
  });

  describe("ルール編集", () => {
    test("既存ルールを編集してSaveするとonUpdateが呼ばれる", async () => {
      const props = handlers();
      await renderWithChakra(
        <RulesEdit rules={entries(singleRule)} isAddAllowed {...props} />
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

      // ルールのIDと入力した内容で呼ばれる
      await expect.poll(() => props.onUpdate.mock.calls.length).toBe(1);
      const [id, rule] = props.onUpdate.mock.calls[0] as unknown as [number, Rule];
      expect(id).toBe(1);
      expect(rule.condition.urlFilter).toBe("||tracking.com^");
    });
  });

  describe("ルール削除", () => {
    test("複数ルールの場合、ルールを削除できる", async () => {
      const props = handlers();
      await renderWithChakra(
        <RulesEdit rules={entries(twoRules)} isAddAllowed {...props} />
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

      // 1番目のルールのIDで呼ばれる
      await expect.poll(() => props.onRemove.mock.calls).toEqual([[1]]);
    });
  });

  describe("キャンセル操作", () => {
    test("新規ルール編集中にCancelでルールが削除される", async () => {
      await renderWithChakra(<StatefulRulesEdit initialRules={simpleRule} />);

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

      // 追加中のルールがなくなっている
      await expect.element(page.getByText("Editing")).not.toBeInTheDocument();
    });

    test("既存ルール編集中にCancelで変更が破棄される", async () => {
      await renderWithChakra(
        <RulesEdit rules={entries(singleRule)} isAddAllowed {...handlers()} />
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
      const props = handlers();
      await renderWithChakra(
        <RulesEdit rules={entries(twoRules)} isAddAllowed {...props} />
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

      // 2番目のルールのIDで呼ばれる
      await expect.poll(() => props.onUpdate.mock.calls.length).toBe(1);
      const [id, rule] = props.onUpdate.mock.calls[0] as unknown as [number, Rule];
      expect(id).toBe(2);
      expect(rule.condition.initiatorDomains).toContain("updated.com");
    });
  });

  describe("Rule limit", () => {
    test("disables adding a rule and says why", async () => {
      await renderWithChakra(
        <RulesEdit rules={entries(singleRule)} isAddAllowed={false} {...handlers()} />
      );

      await expect
        .element(page.getByRole("button", { name: "Add a Rule", exact: true }))
        .toBeDisabled();
      await expect
        .element(page.getByText("You can define up to 500 rules."))
        .toBeVisible();
    });
  });
});
