import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { renderWithChakra } from "@/test/utils/render";
import { RuleEdit } from "./RuleEdit";

// テスト用の有効なルール
const validRule: Rule = {
  id: 1,
  action: { type: RuleActionType.BLOCK },
  condition: {
    requestDomains: ["example.com"],
    urlFilter: "*ads*",
  },
};

// テスト用のAllowルール
const allowRule: Rule = {
  id: 2,
  action: { type: RuleActionType.ALLOW },
  condition: {
    initiatorDomains: ["trusted.com"],
    urlFilter: "api/*",
  },
};

// テスト用の無効なルール（条件なし）
const invalidRule: Rule = {
  action: { type: RuleActionType.BLOCK },
  condition: {},
};

// 正規表現フィルター付きルール
const regexRule: Rule = {
  id: 3,
  action: { type: RuleActionType.BLOCK },
  condition: {
    urlFilter: "^https?://.*\\.example\\.com/",
    isRegexFilter: true,
  },
};

describe("RuleEdit component", () => {
  // RuleEditコンポーネント用にビューポートを設定
  beforeAll(async () => {
    await page.viewport(800, 900);
  });

  describe("初期表示（ビューモード）", () => {
    test("有効なBlockルールがビューモードで表示される", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // Blockアクションが表示される（小文字の"block"）
      await expect
        .element(page.getByText("block", { exact: true }))
        .toBeInTheDocument();

      // requestDomainsが表示される（exactマッチで重複を避ける）
      await expect
        .element(page.getByText("example.com", { exact: true }))
        .toBeInTheDocument();

      // urlFilterが表示される
      await expect.element(page.getByText("*ads*")).toBeInTheDocument();

      // Editボタンが表示される
      await expect
        .element(page.getByRole("button", { name: /edit/i }))
        .toBeInTheDocument();

      // 編集モードではないのでControlButtonsは表示されない
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .not.toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleEdit-view-block"
      );
    });

    test("有効なAllowルールがビューモードで表示される", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={allowRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // Allowアクションが表示される（小文字の"allow"）
      await expect
        .element(page.getByText("allow", { exact: true }))
        .toBeInTheDocument();

      // initiatorDomainsが表示される
      await expect.element(page.getByText("trusted.com")).toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleEdit-view-allow"
      );
    });

    test("正規表現フィルター付きルールが表示される", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={regexRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // urlFilterが表示される
      await expect
        .element(page.getByText("^https?://.*\\.example\\.com/"))
        .toBeInTheDocument();

      // 正規表現であることが示される（Use regex）
      await expect.element(page.getByText(/use regex/i)).toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleEdit-view-regex"
      );
    });
  });

  describe("無効なルールでの自動編集モード", () => {
    test("条件なしのルールは自動的に編集モードになる", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={invalidRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードなのでControlButtonsが表示される
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeInTheDocument();

      // 編集モードなのでSaveボタンは無効（バリデーションエラー）
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeDisabled();

      // Editingタグが表示される
      await expect.element(page.getByText("Editing")).toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleEdit-auto-edit-invalid"
      );
    });
  });

  describe("編集モードへの切り替え", () => {
    test("Editボタンクリックで編集モードに入る", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 初期状態ではビューモード
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .not.toBeInTheDocument();

      // Editボタンをクリック
      await page.getByRole("button", { name: /edit/i }).click();

      // 編集モードに切り替わる
      await expect.element(page.getByText("Editing")).toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("button", { name: /cancel/i }))
        .toBeInTheDocument();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleEdit-edit-mode"
      );
    });
  });

  describe("フィールドの編集", () => {
    test("ActionTypeをBlock→Allowに変更できる", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={onChange}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // Allowラジオボタンのラベルをクリック（ラベルテキストで選択）
      await page.getByText("allow", { exact: true }).click();

      // 保存
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          action: { type: RuleActionType.ALLOW },
        })
      );
    });

    test("RequestDomainsを編集できる", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={onChange}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // RequestDomainsの入力フィールドを見つける（最初のtextbox）
      const requestDomainsInput = page.getByRole("textbox").nth(0);

      // 入力値をクリアして新しい値を入力
      await requestDomainsInput.clear();
      await requestDomainsInput.fill("newdomain.com, anotherdomain.org");

      // 保存
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          condition: expect.objectContaining({
            requestDomains: ["newdomain.com", "anotherdomain.org"],
          }),
        })
      );
    });

    test("URLFilterを編集できる", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={onChange}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // URLFilterの入力フィールドを見つける（3番目のtextbox）
      const urlFilterInput = page.getByRole("textbox").nth(2);

      // 入力値をクリアして新しい値を入力
      await urlFilterInput.clear();
      await urlFilterInput.fill("||tracking.com^");

      // 保存
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          condition: expect.objectContaining({
            urlFilter: "||tracking.com^",
          }),
        })
      );
    });

    test("IsRegexFilterを有効にできる", async () => {
      // 正規表現として有効なurlFilterを持つルールを使用
      const ruleWithValidRegexUrl: Rule = {
        id: 4,
        action: { type: RuleActionType.BLOCK },
        condition: {
          requestDomains: ["example.com"],
          urlFilter: ".*ads.*", // 正規表現として有効
        },
      };

      const onChange = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={ruleWithValidRegexUrl}
            isRemoveEnabled={true}
            onChange={onChange}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // 正規表現チェックボックスのラベルをクリック
      await page.getByText("Use regex", { exact: true }).click();

      // 保存
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          condition: expect.objectContaining({
            isRegexFilter: true,
          }),
        })
      );
    });
  });

  describe("バリデーション", () => {
    test("無効な正規表現でエラーが表示される", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={regexRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // URLFilterの入力フィールドを見つける（3番目のtextbox）
      const urlFilterInput = page.getByRole("textbox").nth(2);

      // 無効な正規表現を入力
      await urlFilterInput.clear();
      await urlFilterInput.fill("[invalid(regex");

      // エラーメッセージが表示されるまで待つ（具体的なメッセージを探す）
      await expect
        .element(page.getByText(/must not be an invalid regular expression/i))
        .toBeInTheDocument();

      // Saveボタンが無効になる
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeDisabled();

      // VRTスクリーンショット
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleEdit-validation-error"
      );
    });

    test("全ての条件を空にするとエラーになる", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // 全ての入力フィールドをクリア
      const textboxes = page.getByRole("textbox");
      const count = await textboxes.all();
      for (let i = 0; i < count.length; i++) {
        await textboxes.nth(i).clear();
      }

      // Saveボタンが無効になる
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .toBeDisabled();
    });
  });

  describe("保存操作", () => {
    test("Saveボタンクリックでルールが保存される", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={onChange}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // 保存
      await page.getByRole("button", { name: /save/i }).click();

      // onChangeが呼ばれる
      expect(onChange).toHaveBeenCalled();

      // ビューモードに戻る
      await expect
        .element(page.getByRole("button", { name: /save/i }))
        .not.toBeInTheDocument();
    });
  });

  describe("キャンセル操作", () => {
    test("Cancelボタンクリックで変更が破棄される", async () => {
      const onCancel = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={onCancel}
            onRemove={() => {}}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // URLFilterを変更
      const urlFilterInput = page.getByRole("textbox").nth(2);
      await urlFilterInput.clear();
      await urlFilterInput.fill("changed-filter");

      // キャンセル
      await page.getByRole("button", { name: /cancel/i }).click();

      // onCancelが呼ばれる
      expect(onCancel).toHaveBeenCalled();

      // ビューモードに戻り、元の値が表示される
      await expect.element(page.getByText("*ads*")).toBeInTheDocument();
    });
  });

  describe("削除操作", () => {
    test("EditMenuからRemoveでルールが削除される", async () => {
      const onRemove = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={onRemove}
          />
        </div>
      );

      // メニューボタンをクリック
      const menuButton = page.getByRole("button", { name: "more" });
      await menuButton.click();

      // メニューが表示されるまで待つ
      await expect
        .element(page.getByRole("menuitem", { name: /remove/i }))
        .toBeInTheDocument();

      // Removeメニュー項目をクリック（確認ダイアログが開く）
      await page.getByRole("menuitem", { name: /remove/i }).click();

      // 確認ダイアログが表示されるまで待つ
      await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

      // ダイアログ内のRemoveボタンをクリック（colorScheme="red"のボタン）
      const dialogRemoveButton = page
        .getByRole("alertdialog")
        .getByRole("button", { name: /remove/i });
      await dialogRemoveButton.click();

      // onRemoveが呼ばれる
      expect(onRemove).toHaveBeenCalled();
    });

    test("isRemoveEnabledがfalseの場合メニューボタンが表示されない", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={false}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={() => {}}
          />
        </div>
      );

      // メニューボタンが表示されない
      await expect
        .element(page.getByRole("button", { name: "more" }))
        .not.toBeInTheDocument();
    });

    test("編集モードでControlButtonsからRemoveできる", async () => {
      const onRemove = vi.fn();
      await renderWithChakra(
        <div data-testid="container">
          <RuleEdit
            rule={validRule}
            isRemoveEnabled={true}
            onChange={() => {}}
            onCancel={() => {}}
            onRemove={onRemove}
          />
        </div>
      );

      // 編集モードに入る
      await page.getByRole("button", { name: /edit/i }).click();

      // Removeボタンをクリック（確認ダイアログが開く）
      await page.getByRole("button", { name: /remove/i }).click();

      // 確認ダイアログが表示されるまで待つ
      await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

      // ダイアログ内のRemoveボタンをクリック
      const dialogRemoveButton = page
        .getByRole("alertdialog")
        .getByRole("button", { name: /remove/i });
      await dialogRemoveButton.click();

      // onRemoveが呼ばれる
      expect(onRemove).toHaveBeenCalled();
    });
  });
});
