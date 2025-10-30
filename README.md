# EckoWALLET Mobile

## Powered by Flux · The Gateway to Kadena.

**EckoWALLET** is a secure and user-friendly wallet for managing your Kadena assets. Available on **Android**, **iOS**, and as a **Chrome Extension**, it allows seamless interaction with decentralized applications through **WalletConnect**, as well as robust token management and transaction signing.

---

### 📱 Download EckoWALLET

- **Android:** [Download on Google Play](https://play.google.com/store/apps/details?id=com.xwallet.mobile&hl=it&pli=1)
- **iOS:** [Download on the App Store](https://apps.apple.com/us/app/eckowallet/id1632056372)
- **Chrome Extension:** [EckoWALLET on Chrome Web Store](https://chromewebstore.google.com/detail/eckowallet/bofddndhbegljegmpmnlbhcejofmjgbn?pli=1)

Official site: [eckowallet.com](https://eckowallet.com)

---

## ✨ Why Choose EckoWALLET?

- **Self-Custodial**: Full control over your private keys and funds.
- **Secure Recovery**: Industry-standard 12-word seed phrase backup and secure onboarding.
- **WalletConnect Support**: Connect with Kadena dApps in just a few taps.
- **NFT Support**: View and manage NFTs on supported Kadena networks.
- **Staking, Swaps & Governance**: Participate in the Kadena ecosystem directly from the app.
- **Cross-Platform Access**: Mobile and browser extension available for full accessibility.
- **Fiat On-Ramp**: Easily purchase Kadena (KDA) with fiat currencies directly from the wallet.
- **Auto Token Detection**: Automatically detects and displays supported tokens already owned by your wallet.

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/RunOnFlux/ecko-wallet-mobile.git
cd ecko-wallet-mobile
```

### 2. Prepare Environment

```bash
cp .env.example .env
# Fill in the required variables in .env
```

### 3. Run on Android

```bash
yarn
yarn start
yarn android
```

### 4. Run on iOS

```bash
cd ios
pod install
cd ..
yarn ios
```

---

## 🛡️ Security Highlights

- 🔍 **Audit by CertiK**: EckoWALLET has undergone a professional security audit. [View the audit on CertiK Skynet](https://skynet.certik.com/wallets/eckowallet)
- **Seed Phrase Verification Required**: Login and access restricted until seed is backed up.
- **Biometric & PIN Security**: Local authentication via biometrics or user-defined PIN.
- **Non-Custodial Architecture**: No third-party access to keys or user data.
- **Secure Onboarding Flow**: Protected onboarding with enforced recovery phrase verification.

---

## 📄 Documentation & Resources

- [EckoWALLET Documentation](https://docs.eckowallet.com)
- [Ecko Discord](https://discord.com/invite/runonflux) - Join the community

---

## ✨ Contributions

We welcome community contributions to improve EckoWALLET. Please open issues or submit pull requests via [GitHub](https://github.com/RunOnFlux/ecko-wallet-mobile).

---

## 📌 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 🚨 Disclaimer

By using EckoWALLET, you agree to the terms outlined in the Disclaimer. Always back up your seed phrase and never share it with anyone. EckoWALLET does not store any private keys or sensitive data on central servers.

---

## 📈 Analytics & Metrics

- Weekly usage metrics (opt-in only)
- No personal data collection
- Used solely to improve UX and app performance

---

Let's build the future of Kadena, together. ✨
