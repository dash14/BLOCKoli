// Browser test setup
// useRuleEdit等の非同期バリデーションによるact()警告を抑制
// Vitestブラウザモードではact()が完全にサポートされていないため

// React act() 警告をフィルタリング
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    message.includes("inside a test was not wrapped in act")
  ) {
    return; // act() 警告を抑制
  }
  originalError.apply(console, args);
};
