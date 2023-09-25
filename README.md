# BLOCKoli - Web request blocker

[English](./README.md) •
[日本語 (Japanese)](./README.ja.md)

BLOCKoli (pronounced /blɑ'kəli/, like the "R" in broccoli with an "L") is
a Chrome extension that allows you to block or allow web network requests with
easy configuration.

[Chrome Web Store - BLOCKoli](https://chrome.google.com/webstore/detail/blockoli/fekkdhfmnpifpdgipnkjgfaalcffdeih)

[![BLOCKoli](./images/brand.png)](https://chrome.google.com/webstore/detail/blockoli/fekkdhfmnpifpdgipnkjgfaalcffdeih)

[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/dash14/BLOCKoli/main?label=Version)](./package.json)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/fekkdhfmnpifpdgipnkjgfaalcffdeih?label=Chrome%20Web%20Store)](https://chrome.google.com/webstore/detail/blockoli/fekkdhfmnpifpdgipnkjgfaalcffdeih)
[![GitHub](https://img.shields.io/github/license/dash14/BLOCKoli)](./LICENSE)

For example, it is useful in the following situations:
* In user support operations for web services, block modification requests (POST, PATCH, PUT, DELETE) to the target web site to prevent inadvertent modification of user data.
* In web development, block specific requests and make them fail to check the system behavior.
* When using a pay-as-you-go network, suppress communication charges by blocking request for image and media resources.

Features:
* Rule definition with flexibility
  * Rules can be defined to block or allow (exceptions to block) network requests based on domain, URL, request method, and resource type
* Safe as only minimal permissions are required
  * Unlike many other network blocking extensions, this extension does not require permissions to read and change all your data on all websites or to read your browsing history
* Work results can be checked
  * Users can view a list of rules that blocked or allowed requests within a specific tab

The conditions for blocking or allowing, definable as rules, are as follows:
* Request Domains
* Initiator Domains
* Request Methods
* URL Filter
* Resource Types


## License

Under the MIT license.  
See [LICENSE](./LICENSE) file for more details.


## ⚠ Notice

We are not responsible for any loss, damage or inconvenience caused by
the use of this extension. This includes those caused by bugs in this
extension as well as misuse.

## Contributing

If you find any bugs and/or want to contribute, feel free to submit issues or pull requests.

## Support me 🌟

I love to hear from people using it, giving me the motivation to keep working on this project.  
If you find this extension helpful, please consider giving it a star ⭐ on GitHub!

You may GitHub Sponsors or Buy Me a Coffee if you would like to show some support for this open-source project. It will be greatly appreciated!

[!["Github Sponsors"](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA)](https://github.com/sponsors/dash14)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/dash14.ack)
