# 📄 PDF Summarizer

## 🚀 Overview

PDF Summarizer is a web application that allows users to upload PDF files and generate concise summaries instantly. It is designed to save time by extracting the most important information from lengthy documents using an AI-powered backend.

---

## ✨ Features

* 📤 Upload PDF files بسهولة
* 📖 Preview uploaded PDF
* ⚡ Generate quick and accurate summaries
* 🔐 User authentication (Sign up / Sign in)
* 💾 Secure token-based session handling
* 🎯 Clean and responsive UI

---

## 🛠️ Tech Stack

**Frontend:**

* Next.js (App Router)
* React
* Tailwind CSS
* Axios

**Backend (API):**

* Node.js / Express (connected via API)
* AI-based summarization service

**Other Tools:**

* PDF.js (for rendering PDF preview)
* React Hot Toast (notifications)
* Lucide Icons

---

## ⚙️ How It Works

1. User uploads a PDF file from their device.
2. The app validates the file type (only PDFs allowed).
3. The PDF is previewed using PDF.js in the browser.
4. The file is sent to the backend API.
5. The backend processes the PDF and generates a summary using AI.
6. The summarized content is returned and displayed to the user.

---

## 🔐 Authentication

* Users can sign up or log in to access full functionality.
* JWT tokens are stored in local storage for session management.
* Protected routes ensure only authenticated users can generate summaries.

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd my-pdfsummarizer
npm install
npm run dev
```

---

## 🌐 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📌 Future Improvements

* Support for large PDFs
* Highlight key points in summary
* Download summary as PDF or text
* Multi-language summarization

---

## 🤝 Contribution

Feel free to fork this project, open issues, and submit pull requests to improve it.

---

## 📜 License

This project is open-source and available under the MIT License.
