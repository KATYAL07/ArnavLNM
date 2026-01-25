# 🌌 MonadLisa: Own the Internet. Profit When You Lose.

> **Built for the LNMHacks Hackathon on Monad.** 
> The first decentralized billboard where you get paid to be outbid. Buy the spot, display your message, and earn 5% instantly when someone steals it.

---

## 🚀 Live Demo
**👉  https://dep-01d17734-7050-4237-9f16-fc717853ac23.tyzo.nodeops.app/#how-it-works

---

## 📖 About the Project

**MonadLisa** (part of the Aura Financial ecosystem) is a censorship-resistant, decentralized billboard built on the Monad Testnet. It introduces a **Viral Economic Model** to digital advertising. 

The concept is simple: The billboard is public. Anyone can overwrite the current message, but to do so, they must pay **10% more** than the previous price. When they do, the smart contract automatically executes a payout: the previous owner gets their initial bid back **plus a 5% profit instantly**. The remaining 5% goes to the protocol treasury to fund development.

### Why it matters:
* **Zero Latency**: Powered by Monad's parallel execution.
* **Censorship Resistant**: Messages are stored immutably on the Monad Blockchain.
* **Gamified Finance**: It turns simple advertising into a high-stakes, profitable game.

---

## ✨ Key Features

* **💸 Viral Economics:** Ad space that pays you. The hotter the bidding war, the more everyone earns.
* **🤖 Aura Agent (AI Integration):** An embedded, on-chain-aware AI assistant that guides users, explains protocol rules, and calculates costs without ever asking for private keys.
* **📡 Live Network Feed:** Real-time visual updates of network activity and bidding wars.
* **🏆 Top Bidder Leaderboard:** Tracks the most profitable and active billboard owners.
* **🎨 Premium UI/UX:** Features glassmorphism, zero-latency feedback, interactive flashlight/spotlight effects, and SVG animations.

---

## 🤖 Meet "Aura Agent"

We integrated **Aura Agent**, an agentic AI assistant designed specifically for our dApp.
* **State-Aware:** It reads the live Monad blockchain to tell users the current price, next minimum bid, and current message.
* **Beginner Friendly:** Explains gas fees, wallet pop-ups, and transaction irreversibility in simple terms.
* **Non-Custodial Security:** It NEVER executes actions, signs transactions, or asks for sensitive wallet data.

---

## 🛠️ Tech Stack

### Frontend & UI
* **HTML5 & Vanilla JavaScript** for a lightweight, fast architecture.
* **TailwindCSS** for rapid, responsive, and futuristic styling.
* **Ethers.js (v5.7.2)** for seamless EVM blockchain integration.

### Smart Contract & Blockchain
* **Network:** Monad Testnet
* **Contract Address:** `0x3d9AC42844315518D05dCF6000C3f74BB72cdd5a`
* **ABI Functions:** `buySpot()`, `message()`, `price()`

---

## 💻 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/monadlisa.git](https://github.com/your-username/monadlisa.git)
   cd monadlisa
