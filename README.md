# Somnia Library 🌙
> *"Your shelves wait in the dark. A sanctuary for the stories that haunt you."*

An immersive, **Gothic-inspired digital bookshelf** that captures the cozy, gaslit atmosphere of a New Orleans midnight. Built for readers who crave aesthetics as much as narrative, Somnia is powered by **React 19, TypeScript, Vite 6, Tailwind CSS v4, and Supabase**.

---

## 📜 Credits & License
This project is a darkly beautiful evolution derived from the original **[Reverie](https://github.com/Reverie-Reads/reverie)** framework, designed and developed by **Greg Chism**.

- **Original Framework:** [Reverie Reads](https://reveriereads.app/)
- **License:** Licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](./LICENSE).
- *Special thanks to Greg Chism for laying the atmospheric foundation and guiding the design philosophy.*

---

## 🔮 Features of the Sanctuary

Somnia is more than a library; it is a fully immersive digital sanctum to organize, track, and unearth your next obsession:

* 📚 **The Vault & Custom Shelves:** Intuitively organize your reading journey with statuses (Reading, Want to Read, Finished) and create deeply personalized digital shelves.
* 🗓️ **The Lunar Planner:** Drag and drop your ever-growing TBR (To Be Read) list onto an interactive, atmospheric monthly calendar.
* ✨ **Match & Discover:** Swipe through curated recommendations attuned to your unique trope preferences and aesthetic vibes.
* 📈 **Deep Chronicles & Analytics:** Visualize your reading velocity, genre breakdowns, and completion rates with elegant, gaslit-styled charts.
* 🎭 **Tropes & Dynamic Themes:** Filter your entire library by hyper-specific tropes (e.g., `#EnemiesToLovers`, `#FoundFamily`, `#SlowBurn`). Change the entire app's colorway to match your mood.
* 👥 **Reader Circles:** Join private book clubs to share progress, exchange thoughts, and discover books together.

---

## 🎨 The Nocturne Design System

Somnia operates strictly on a custom **"Midnight Abyss"** aesthetic designed for the late-night reader:

* **Background (`bg0`):** Deep Midnight Violet (`#0b0612`) - mimicking the Vault's abyss.
* **Accent Palette:** Gaslight Amber (`#f0b14e`), Patron Magenta (`#e83a78`), and Romantic Orchid (`#7b3fa0`).
* **Atmosphere:** Soft vignette shadows, breathing aurora nebulae, high-fidelity skeuomorphic 3D shelves, and delicate glassmorphism elements.

---

## 🛠️ Architecture & Tech Stack

### Front-End
- **Framework:** React 19 + TypeScript (Type-safe components)
- **Build Tool:** Vite 6+ (Leveraging `@tailwindcss/vite`)
- **Styling:** Tailwind CSS v4 (Modern CSS-first configuration for zero-lag responsive design)

### Back-End (The Vault)
- **Database & Auth:** [Supabase](https://supabase.com) (PostgreSQL for the books, syncing, and user data)
- **Realtime Sync:** Dynamic user collection synchronization, instant favorite/read status updates, and calendar scheduling.

---

## 🚀 Local Development & Magic Initiation

Follow these steps to bring **Somnia Library** to life on your local machine.

### 1. Prerequisites
Ensure you have the modern tooling necessary:
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/somnia-library.git
cd somnia-library
```

### 3. Install Dependencies

Install all required Node modules using npm:

```bash
npm install
```

### 4. Configure Environment Variables

1. Create a .env.local file in the root directory:

```bash
cp .env.example .env.local
# or manually create .env.local
```

2. Fill in your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

💡 Database Setup Note: Ensure your Supabase instance has the required tables created (books, user_book_status, user_book_plans, user_favorites, etc.).

### 5. Start Local Development

Light the candles and launch the development server:

```bash
npm run dev
```
---
## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the Issues page.

---

## 🖤 License
Distributed under the AGPL-3.0 License. See LICENSE for more information.