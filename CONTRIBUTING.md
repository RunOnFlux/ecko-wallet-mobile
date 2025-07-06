# Contributing to EckoWALLET Mobile

Thank you for your interest in contributing to **EckoWALLET Mobile**!  
This project is open-source and community-driven — your ideas, code, and feedback are always welcome. 💜

---

## 📦 Project Overview

EckoWALLET Mobile is a cross-platform crypto wallet built for the **Kadena ecosystem**, offering support for tokens, NFTs, WalletConnect, fiat on-ramps, and more.  
It is available on **Android**, **iOS**, and as a **Chrome extension**.

---

## 🙌 Ways to Contribute

You can help in many ways:

- 🐛 Reporting bugs
- 💡 Suggesting features
- 🛠️ Submitting code improvements or fixes
- 🌐 Helping with translations
- 📝 Improving documentation

---

## 🚀 Getting Started (Local Dev)

To start contributing to the codebase:

1. **Fork the repo**  
   https://github.com/RunOnFlux/ecko-wallet-mobile

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/ecko-wallet-mobile.git
   cd ecko-wallet-mobile
   ```

3. **Install dependencies**

   ```bash
   yarn
   cp .env.example .env
   # Fill in environment variables as needed
   ```

4. **Run the project**

   - For Android:

     ```bash
     yarn start
     yarn android
     ```

   - For iOS:

     ```bash
     cd ios && pod install && cd ..
     yarn ios
     ```

---

## 🧪 Code Style & Conventions

- Use **Prettier** for code formatting (`yarn format`)
- Keep pull requests focused on one topic or issue
- Prefer descriptive commit messages
- Follow existing naming and structure for components and screens

---

## 🛡️ Security & Privacy

Do **not** submit any sensitive info or real seed phrases in issues or PRs.

All security-sensitive bugs can be reported privately by contacting the team on [Discord](https://discord.com/invite/QSJpHRFDcv).

---

## 🌐 Help Translate EckoWALLET

We're actively expanding EckoWALLET to more languages.  
You can contribute to translations via our Crowdin platform (coming soon).  
For now, open a PR with updates to the `i18n` files inside the project if you'd like to help.

---

## 📥 Submitting a Pull Request

1. Create a new branch from `develop`  
   Example: `feature/add-language-selector`

2. Push your changes and open a pull request to `develop`

3. Fill out the PR template explaining what the change does

4. A maintainer will review and suggest changes if needed

---

## 🧠 Tips for a Smooth Review

- Keep PRs focused and small
- Add screenshots or video for UI changes
- Link related issues or tickets
- Be responsive in case of feedback

---

## 💬 Community

- Questions or discussions? Join us on [Discord](https://discord.com/invite/QSJpHRFDcv)
- Bugs? Open an [issue on GitHub](https://github.com/RunOnFlux/ecko-wallet-mobile/issues)

---

## 🧾 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Thanks again for helping improve EckoWALLET Mobile 🙌  
Let's build the future of Kadena, together.

---

## 🧭 Code of Conduct

Please note that this project is governed by a [Code of Conduct](./CODE_OF_CONDUCT.md).  
By participating, you are expected to uphold this code and contribute respectfully.
