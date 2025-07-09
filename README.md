# Web3 AI Assistant

An AI-powered assistant built for Web3 developers, enthusiasts, and builders. This project leverages modern frontend technologies to provide real-time assistance, queries, and prompts tailored for the decentralized world.

🌐 **Live Demo**: [https://web3-ai-six.vercel.app](https://web3-ai-six.vercel.app)

---

## 🛠 Tech Stack

- **React**  
- **TypeScript**  
- **Tailwind CSS**  
- **shadcn/ui**  
- **Vite**  
- **OpenAI / Gemini API (for AI assistant)**  
- **Vercel (for deployment)**

---

## 🚀 Getting Started

To run the project locally:

### 1. Clone the repository

```bash
git clone <your_git_url>
cd <project_directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create a `.env` file in the root of the project and add your API key(s):

```
GEMINI_API_KEY=your_gemini_or_openai_key_here
```

### 4. Start the dev server

```bash
npm run dev
```

---

## 📦 Deployment

This project is deployed on **Vercel**.

To deploy your own version:

1. Push this project to a GitHub repository.
2. Visit [https://vercel.com/import](https://vercel.com/import).
3. Connect your GitHub repo.
4. Add environment variables in Vercel dashboard.
5. Click **Deploy**.

---

## 📁 Project Structure

```
.
├── components/       # Reusable UI components
├── public/           # Static assets
├── src/
│   ├── app/          # Main application logic
│   ├── lib/          # API & utility functions
│   └── styles/       # Tailwind config and styles
├── .env              # API keys and secrets (not committed)
├── package.json      # Project metadata and scripts
└── vite.config.ts    # Vite configuration
```

---

## 📄 License

MIT License © 2025 Daivik Soni
