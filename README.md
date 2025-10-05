# SaveUrURL

A clean, fast, and minimal **Next.js** web app that allows users to save and manage important links — with support for filtering, searching, and deleting. Built using **Drizzle ORM** and **Neon (PostgreSQL)**.

🔗 **Live Site:** [saveururl.vercel.app](https://saveururl.vercel.app)

---

## ✨ Features

- ✅ Save your links with metadata:
  - **Label** (Name)
  - **URL** (Source)
  - **Category**
  - **Description**
- 📂 View all saved links in a list
- 🔎 **Search** by label
- 🎯 **Filter** by category or source
- 🗑️ Delete links anytime
- ⚡ Simple, fast, and responsive UI
- 💾 Data is stored in a Neon-hosted PostgreSQL database via **Drizzle ORM**

---


## 🧰 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sazzadadib/saveururl.git
cd saveururl
````

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create a `.env` file in the root with the following:

```env
DATABASE_URL="your_neon_postgresql_connection_url"
```

### 4. To push your schema:

```bash
npx drizzle-kit push
```


### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---


## 📌 Usage Guide

1. Visit [saveururl.vercel.app](https://saveururl.vercel.app)
2. Add your important links
3. Use filters or search to quickly find them
4. Delete links anytime

---

## 🛡️ License

MIT License. You’re free to use, modify, and distribute.

---

## 🤝 Contributions

Have ideas or improvements? Open a pull request or submit an issue — all contributions are welcome.

---

## 📬 Contact

Have questions or feedback? Reach out via GitHub Issues or fork the project.
