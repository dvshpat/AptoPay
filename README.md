# 🛡️ Secure-Pay – Reversible Payment System for the **Aptos Ecosystem**

<img width="1846" height="989" alt="image" src="https://github.com/user-attachments/assets/a20b441a-cda7-4248-bca1-6401464d9905" />

## Overview

**Secure-Pay** is a next-generation **reversible crypto payment platform** built natively for the **Aptos blockchain**, designed to revolutionize how users send and receive cryptocurrency using simple usernames instead of complex wallet addresses.

From a single, intuitive dashboard, users can send crypto payments using usernames with customizable expiration times, claim payments before they expire, automatically refund unclaimed payments, and track all transaction history with complete **on-chain transparency**. Every payment is secured by **Move smart contracts**, ensuring funds are protected until claimed or automatically returned to the sender.

With Secure-Pay, crypto payments on Aptos aren't just faster and cheaper — they’re **user-friendly, reversible, and trustless**, built for the next generation of decentralized commerce.

---

## 🌐 Resources

| Resource | Link |
|----------|------|
| GitHub Repository | 🔗 [View on GitHub](https://github.com/Sushant041/secure-pay) |
| Live Demo | 🔗 [Open Secure-Pay](https://secure-pay-a8zn.vercel.app/) |
| Demo Video | 🔗 [Watch on YouTube](https://www.youtube.com/watch?v=dTbT9lKF738) |
| Aptos Explorer – Smart Contract | 🔗 [View Contract](https://explorer.aptoslabs.com/account/0x561e3de8c948305003be617b7ce5f5280aa36798ea256a8fab13fe21c2e040f4/modules/code/escrow_vault?network=testnet) |
| Pitch Deck | 🔗 [View Presentation](https://docs.google.com/presentation/d/1niEm5j5eUhE0_fxOdb4njMoavFEFQMAAB8DRtqt0In8/edit?slide=id.p7#slide=id.p7) |

---

## 💡 The Problems in Web3 Payments Today

- **Complex wallet addresses** make crypto transfers confusing and error-prone  
- **No reversibility** — payments sent to the wrong address are lost forever  
- **Unclaimed funds** stay stuck without refund options  
- **Poor UX** with long, technical addresses  
- **No time-bound payment controls**  
- **Inefficient smart contracts** cause unnecessary fees  

---

## 🚀 Secure-Pay’s Solution on Aptos

- **Username-Based Payments** – Send crypto using usernames instead of wallet addresses  
- **Reversible Payments** – Automatically refund unclaimed payments  
- **Time-Bound Security** – Customizable expiration times (minutes → days)  
- **Move Smart Contract Logic** – Funds secured until claimed or refunded  
- **Transparent Tracking** – Every transaction visible on Aptos Explorer  
- **User-Friendly Interface** – Clean, intuitive web dashboard  
- **Bank-Free & Global** – Instant blockchain settlement with low fees  

---

## 🔥 Why Secure-Pay Stands Out on Aptos

### Complete Payment Lifecycle  
Unlike typical payment dApps, Secure-Pay manages deposits, claims, refunds, and expiration — all **on-chain**.

### Time-Bound Security  
Payments automatically expire and refund after the set time, reducing risks of loss.

### Move Smart Contract Architecture  
Built with **Aptos Move**, ensuring **safety**, **modularity**, and **gas efficiency**.

### Integrated User Portal  
Senders and receivers get full visibility of payments, statuses, and history — in real time.

---

## ✨ Key Features

### For Senders
- Create reversible payments with expiry times  
- Choose recipients by username or wallet  
- Track pending, completed, and refunded transactions  
- Automatically refund expired payments  

### For Receivers
- View incoming payments in an interactive dashboard  
- One-click payment claiming  
- Real-time expiry countdowns  
- Filter and sort by payment status  

### Smart Contract Capabilities
- Funds securely held until claimed or expired  
- Automatic refunds to senders after expiration  
- Prevents invalid expiry timestamps  
- Optimized for **low gas fees** on Aptos  

---

## ⚙️ Technical Architecture

### Frontend
- **Next.js 15 (App Router)**  
- **TypeScript**  
- **Tailwind CSS**  
- **Aptos Wallet Adapter for React**  

### Backend
- **Next.js API Routes** for serverless logic  
- **MongoDB** with Mongoose  
- **RESTful APIs** for managing payments and users  

### Smart Contracts
- **Move language (Aptos)**  
- Implements a **Reversible Payment Pattern**  
- Handles **deposit, claim, and refund** transactions  
- Optimized for Aptos parallel execution and low gas  

---

## 🧱 Move Smart Contract (Simplified Example)

```move
module secure_pay::reversible_payments {
    struct Payment has key {
        sender: address,
        receiver: address,
        amount: u64,
        expiry: u64,
        claimed: bool,
    }

    public entry fun create_payment(sender: &signer, receiver: address, amount: u64, expiry: u64) { /* ... */ }
    public entry fun claim_payment(receiver: &signer, sender: address) { /* ... */ }
    public entry fun refund_payment(sender: &signer, receiver: address) { /* ... */ }
    public fun view_payment(sender: address, receiver: address): Payment { /* ... */ }
}
