# VibeSphere

**Tagline:** Vibes of Sovereign

VibeSphere is a **sovereign, identity-driven social interface** built on the Pharos Testnet. In VibeSphere, users don’t just interact—they **express their identity** through their avatar, layout, and personal “vibes.” Every user sees the platform in a way that reflects themselves, making every interaction **unique, personal, and sovereign**.

---

## ⚡ Core Concepts

### 1. Sovereign Layout
- Each user can **customize the app layout** based on their avatar.
- Colors, highlights, and interface elements respond to the **identity of the viewer**.
- Multi-user interactions are personalized; two users may see **different layouts** for the same post.

### 2. Posting & Interactions (On-chain & Off-chain)
- **`echo`** – create a post (on-chain via `vibespherepost` smart contract)
- **`r'echo`** – reshare or amplify an existing post
- **`vibe` / `vibing`** – follow/unfollow with a single button, representing alignment
- Likes, bookmarks, and inbox messages are **off-chain**, preserving performance while keeping core actions on-chain.

### 3. Identity & Avatars
- Users mint a **sovereign identity handle** (`.vibes`) via the `vibesphereidentity` contract.
- Avatars drive the **visual identity** across the platform.
- Colors, highlights, and reactions reflect the **user’s avatar**, creating a personalized social experience.

### 4. DeFi & Ecosystem Integration
- VibeSphere acts as a **gateway to Pharos DeFi ecosystem**.
- Users can interact with **Pharos Swap** and track NFTs and market activity without leaving the platform.

---

## 🛠 Installation & Development

### Requirements
- Node.js >= 18
- Vercel CLI for deployment
- Access to Pharos Testnet
- Wallet (MetaMask or compatible)

### Clone Repository
```bash
git clone https://github.com/fiboy83/vibesphere-.git
cd vibesphere-
npm install
🔗 Smart Contracts
VibeSpherePost
On-chain contract for posts (echo) and reshares (r'echo)
Deployed on Pharos Testnet: Contract Address
VibeSphereIdentity
Handles sovereign identity minting (.vibes) and avatar data
Both contracts are deployed on Pharos Testnet for testing purposes.
🎨 Philosophy & Design
Identity-first: Users shape their social interface.
Sovereignty: No global UI mandates; each experience is personal.
Fluidity: Single-button follow/unfollow (vibe → vibing) keeps interactions emotional, not transactional.
Scalable aesthetic: Avatar colors, highlights, and reactions are per-user rendered, respecting device settings.
