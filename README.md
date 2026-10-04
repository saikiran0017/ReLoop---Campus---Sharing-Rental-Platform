# ReLoop - Campus Sharing & Rental Platform

ReLoop is a modern, responsive web application designed for college & university campuses. Students can rent, borrow, or giveaway items (such as drafting tools, calculators, lab coats, textbooks, sports gear, and electronics) with verified trust scores, safe handover workflows, in-app messaging, and a community wanted board.

---

## 📁 Repository Structure

```
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules for node_modules, dist, logs
├── index.html                # HTML5 entrypoint with optimized metadata
├── metadata.json             # Applet capabilities & permissions
├── package.json              # Project dependencies and deployment scripts
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite bundler & Tailwind CSS v4 setup
├── README.md                 # Project architecture & developer guide
└── src/                      # Application Source Code
    ├── main.tsx              # React DOM entrypoint
    ├── App.tsx               # Primary app controller & state orchestration
    ├── index.css             # Tailwind v4 import & custom styles
    ├── types.ts              # Domain TypeScript interfaces & types
    ├── utils.ts              # Formatting, calculation & localStorage helpers
    ├── seedData.ts           # Initial campus catalog, users, requests & chats
    └── components/           # Modular React components
        ├── AccountModal.tsx   # Student profile, .edu verification & PIN settings
        ├── AuthScreen.tsx     # OTP verification, 4-digit PIN & biometric unlock
        ├── BrowseView.tsx     # Campus catalog with search history & category filter
        ├── ChatModal.tsx      # In-app peer messaging with quick prompt chips
        ├── Header.tsx         # Responsive navbar, message badge & dark mode toggle
        ├── ImpactBar.tsx      # Eco & financial savings campus summary
        ├── ItemDetailModal.tsx# Rental calculation, trust discounts & handover spots
        ├── MyStuffView.tsx    # Loan lifecycle, return ratings & listing management
        ├── PostFormModal.tsx  # Item creation & Wanted Board prefill matching
        ├── Toast.tsx          # Real-time feedback notification component
        └── WantedBoard.tsx    # Campus request board with peer fulfillment
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn or bun

### Installation
```bash
npm install
```

### Development Server
Run the local development server at `http://localhost:3000`:
```bash
npm run dev
```

### Production Build & Verification
Build minified, optimized assets for production:
```bash
npm run build
```

Verify strict TypeScript type integrity:
```bash
npm run lint
```

---

## 🌟 Key Features

1. **Campus Authentication & Security**:
   - .edu college email verification with OTP.
   - 4-digit Security PIN keypad and Touch ID / Face ID biometric simulation.
   - Quick demo student profiles for instant testing.

2. **Campus Sharing & Rental Catalog**:
   - Multi-category filtering (Stationery, Books, Electronics, Sports, Hostel, Lab).
   - Mode toggles: *Free Borrow*, *Paid Rent*, *Giveaway*.
   - Instant search with persistent search history.

3. **Trust Score & Deposit Discounts**:
   - Multi-tier system: **New** (0–54), **Trusted** (55–79), **Campus Star** (80–100).
   - Dynamic deposit reductions (50% for Trusted, 100% waiver for Campus Star).

4. **Safe Handover & Return Lifecycle**:
   - Specified public campus pickup locations (Library Foyer, Student Activity Center, Tech Blocks).
   - Handover checklist verification and return rating (+8 Trust Score points).

5. **Campus Wanted Board**:
   - Post item requests when gear isn't yet available.
   - *"I Have This"* one-click prefilling into the listing modal with auto-fulfillment.

6. **In-App Account-to-Account Messaging**:
   - Secure peer chat without exposing personal contact details.
   - Quick campus meetup suggestion chips and automated peer replies.
