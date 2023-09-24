# BLOCKoli - Webリクエストブロッカー

[English](./README.md) •
[日本語 (Japanese)](./README.ja.md)

BLOCKoli は、簡単な設定で Web におけるネットワークリクエストのブロックまたは許可を実現できる Chrome 拡張です。  
発音は野菜の「ブロッコリー」と同じです。

[Chrome Web Store - BLOCKoli](https://chrome.google.com/webstore/detail/blockoli/fekkdhfmnpifpdgipnkjgfaalcffdeih)

[![BLOCKoli](./images/brand.png)](https://chrome.google.com/webstore/detail/blockoli/fekkdhfmnpifpdgipnkjgfaalcffdeih)

[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/dash14/BLOCKoli/main?label=Version)](./package.json)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fekkdhfmnpifpdgipnkjgfaalcffdeih?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/blockoli/fekkdhfmnpifpdgipnkjgfaalcffdeih)
[![GitHub](https://img.shields.io/github/license/dash14/BLOCKoli)](./LICENSE)

例えば、以下のような場面で有用です：
* Webサービスのユーザーサポート業務において、対象ウェブサイトへの変更リクエスト(POST, PATCH, PUT, DELETE)をブロックし、ユーザーデータの不用意な改ざんを防ぐ
* Web開発において、特定のリクエストをブロックして失敗させ、システムの動作をチェックする
* 従量課金制のネットワークを利用する場合に、画像やメディアリソースのリクエストをブロックすることで、通信料金を抑制する

以下の機能が利用できます：
* ブラウザ上で発生するネットワーク要求のブロックまたは許可（ブロッキングの例外）の条件をルールとして定義する
* ルール全体を有効または無効にする
* ブラウザのタブにおいて実際にブロックまたは許可されたルールのリストを表示する
* 他のブロッカー系拡張とは異なり、閲覧履歴やサイトのデータ読み取り権限を必要とせず、安全です

ブロックまたは許可の条件として以下が指定できます：
* リクエスト先ドメイン
* イニシエータドメイン
* リクエストメソッド
* URLフィルタ
* リソース種別

## License

MIT license です。  
詳細は[LICENSE](./LICENSE)ファイルを参照してください。

## ⚠ 注意事項

我々は、この Chrome 拡張の使用によって生じたいかなる損失、損害、不都合に対して一切の責任を負いません。
これには、この拡張機能のバグに起因するもの、誤用によるものも含みます。

## Contributing

バグや誤記などありましたら、ぜひ気軽に Issue や Pull Request を送ってください。

## Support me 🌟

利用者のみなさまの声が、このプロジェクトに取り組み続けるモチベーションになっています。  
もしこの拡張がお役に立てましたら、ぜひ GitHub で ⭐ をつけてください！

このオープンソースプロジェクトをご支援いただける方は、GitHub Sponsors や Buy Me a Coffee
をご利用ください。超絶に感謝いたします！！

[!["Github Sponsors"](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/dash14)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/dash14.ack)
