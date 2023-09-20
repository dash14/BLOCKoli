import { useEffect, useState } from "react";

export function useTitleFontAdjuster(language: string) {
  const [titleFontAdjuster, setTitleFontAdjuster] = useState(0);
  useEffect(() => {
    setTitleFontAdjuster(language === "ja" ? -1 : 0);
  }, [language]);

  return { titleFontAdjuster };
}
