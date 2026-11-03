# Safe in-app test transactions (wallets)

How to exercise a wallet's money flows during PR testing with **zero risk of funds leaving the user's control**. This is the difference between blocking the task (refusing everything) and doing it irresponsibly (typing addresses, external sends).

## The rule

**Internal only. Own account → own account. Never an external or typed address.** External sends are always refused, even if asked.

## Preconditions

- The user must explicitly authorize test transactions. Authorization for *internal* transfers is **not** authorization for external sends — never extends.
- Only transact if the PR actually touches a money flow (send/sign/fee/broadcast). If the diff doesn't, render the screens and skip broadcasting.
- Get the wallet PIN/passcode from the user for the session. Re-enter it when the app prompts to authorize. Never store it (not in memory files, not in the report).

## The safe mechanism

Most multi-account wallets let you pick the destination from your **own** accounts/sub-wallets instead of typing an address (labels like "My Wallets", "Send to my account", "Transfer between accounts"). Use it:

1. Open the coin → Send.
2. Source = an account/sub-wallet that holds balance.
3. Destination = pick another of **your own** accounts from the in-app selector. The address auto-fills — **you never type or paste it**, so it structurally cannot be external.
4. Amount = minimal (dust + fee). Prefer a low-fee, fast-finality coin.
5. Confirm → enter the PIN when prompted → observe the broadcast result (capture the TXID).

If the wallet has no own-account selector, get a second own receive address from its Receive screen and verify it belongs to the user before using it — or stop and ask. Do **not** invent or reuse arbitrary addresses.

## Log every transaction/attempt

Record as JSON for the report (success and failure):

```json
{ "id": "TX1", "coin": "KDA", "fromWallet": "k:abc… (chain 1)", "toWallet": "k:def… (chain 1, own)",
  "toAddress": "k:def…own", "amount": 0.001, "txid": "2f33...ccd",
  "result": "SUCCESS", "external": false }
```

## Interpreting failures

- A broadcast that fails with a clear error dialog = the **error-handling path working** (not a silent failure). Good.
- Attribute the cause precisely: if the failing code is in a file **outside the PR's diff** (e.g. a node endpoint returning 403), it's a pre-existing/environment issue, not a regression introduced by this PR. Say which.
- An over-balance / invalid amount that the app refuses to broadcast = funds safe. Note *when* it was caught (ideally before the PIN step; flag it as UX if only caught after).

## Refuse / stop list

- Typing or pasting any destination address.
- Sending to anything not provably the user's own account.
- Entering a PIN you weren't given.
- Any external send, swap-out, or withdrawal to a third party — regardless of amount.
- Screenshotting seed phrases / private keys — skip or crop those screens.
