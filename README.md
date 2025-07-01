



# 🧠 LifeOS

**LifeOS** is an AI-first personal operating system for managing your mental chaos.

Just type — ideas, tasks, rants, quotes, notes — and LifeOS categorizes and enhances it automatically.  
Powered by Claude Sonnet 3 via OpenRouter, it's your all-in-one thought companion.

---

## 🌟 Key Features

### ✍️ Chat-based Entry
- One input box. No buttons, no forms.
- Messages are automatically categorized via background AI
- Supported categories:  
  `Study`, `Task`, `Idea`, `Rant`, `Log`, `Media`, `Quote`, `Other`

---

## 📂 Category-Specific Intelligence

### 📓 Log (Journal View)
- A chronological journal of everything you've written  
- View all entries across categories in one continuous feed  
- Helps reflect on thoughts, progress, and patterns over time

### 🧠 Study
- Notes are embedded into a **vector DB**
- Ask AI follow-up questions based on your past study inputs

### 💡 Ideas
- Each idea is enhanced with **Why / How / When** dropdowns to deepen thought

### 📊 Rants
- Emotional tone detected via AI  
- Visualized in a **mood chart** across your rant history

### ✅ Tasks
- Support for **priority**, **labels**, and **deadlines**  
- Simple, frictionless task-tracking interface

### 🎬 Media Opinions
- AI tags your opinion as **Hot / Cold / Neutral / Nuclear**  
- Adds a one-liner on **how the public might perceive it**

### 📝 Quotes
- Each quote gets a **generated interpretation or meaning**

---

## 🔐 Auth & Profiles

- Google and Email sign-in via **NextAuth**
- Each user has a **profile pic and username**
- All user data is **fully isolated**

---

## ⚙️ Tech Stack

| Layer        | Tech                                 |
| ------------ | ------------------------------------ |
| Frontend     | Next.js, Tailwind CSS, Framer Motion |
| Backend      | Prisma ORM, PostgreSQL               |
| AI Layer     | Claude Sonnet 3 via OpenRouter       |
| Auth         | NextAuth (Google & Email)            |
| Background   | Inngest for message processing       |
| Embeddings   | Vector DB (for Study category)       |
| Hosting      | Vercel                               |

---

## 🚀 Getting Started

### 1. Clone the repo
```
git clone https://github.com/quwrof00/lifeos.git
cd lifeos
```

### 2. Install dependencies

```
npm install
```

### 3. Environment setup

Create a `.env.local` file using `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lifeos
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client
GOOGLE_CLIENT_SECRET=your_google_secret
OPENROUTER_API_KEY=your_openrouter_key
```

### 4. Prepare the database

```
npx prisma db push
```

### 5. Start the dev server

```
npm run dev
```

---

## ⚙️ How It Works

1. User submits a message via the chatbox
2. It’s saved in the database via Prisma
3. **Inngest** triggers a background job calling **Claude Sonnet 3**
4. AI returns a category → saved → rendered across views


## 📸 Screenshots

Coming soon.

---

## 🤝 Contributing

Currently a solo project. Planning to scale it soon. 

---

## 📬 Contact

DM me on (www.linkedin.com/in/shourya-agrawal-54a5522b0)
or email `shouryaagrawal2806@gmail.com`

---

## 🌐 Live Demo

👉 https://life-os-phi.vercel.app

---
