# 🎓 Loyola Student Portal (ERP Modernization)

A **next-generation College ERP dashboard** that reimagines a legacy student portal with a modern UI/UX, real ERP data scraping, mobile-first design, and production-grade deployment.

This project modernizes how students view attendance, marks, fees, and services — without changing the underlying ERP system.

---

## ✨ Key Highlights

- **Modern UI / UX**  
  Clean, minimal **Neutral/Zinc** design system  
  Dark Mode by default with smooth transitions

- **Live ERP Integration (Backend Powered)**  
  Secure login to the college ERP  
  Real-time scraping of student data (attendance, marks, fees, etc.)

- **Visual Data Analytics**  
  - Attendance donut charts (subject-wise & hour-wise)  
  - SGPA calculation from marks  
  - Fee payment progress visualization  

- **Mobile-First & PWA Ready**  
  Fully responsive layouts  
  Installable as a standalone app (Android / iOS)

- **Smooth Animations**  
  Page transitions and UI micro-interactions using Framer Motion

---

## 🧩 Modules

### 👤 Student Profile
- Academic bio
- Personal & institutional details
- ERP-synced profile data

### 📊 Attendance
- **Subject-wise Attendance**
  - Safe / Detained status (75% rule)
- **Hour-wise Attendance**
  - Donut chart + detailed log view

### 📝 Examination
- **Internal Marks**
  - Accordion-based breakdown
- **External Marks**
  - Grade & SGPA calculator
- **Hall Ticket**
  - Release status & preview (simulated)

### 💰 Finance
- Paid vs Due fees dashboard
- Payment history (simulated gateway)

### 📚 Library & Services
- Library resources (IEEE, DELNET)
- Service shortcuts & student utilities

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React + Vite  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  
- **UI Components**: shadcn/ui (Radix UI)  
- **Charts**: Recharts  
- **Animations**: Framer Motion  
- **Routing**: React Router DOM v6  
- **PWA**: Vite Plugin PWA  

### Backend
- **Runtime**: Node.js  
- **Framework**: Express  
- **Networking**: Axios  
- **Session Handling**: Cookie-based ERP session scraping  
- **Deployment**: Render  

---

## 🗂️ Project Structure

```

erp/
├── api/                # Backend (Express + ERP scraping)
│   └── index.js
│
├── src/                # Frontend (React + Vite)
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── assets/
│
├── dist/               # Production frontend build
├── public/
├── vercel.json         # Frontend deployment config
├── vite.config.ts
└── package.json

````

---

## 🚀 Local Development

### 1️⃣ Clone Repository
```bash
git clone https://github.com/revanthlol/erp.git
cd erp
````

---

### 2️⃣ Start Backend (ERP API)

```bash
cd api
npm install
npm start
```

Backend runs at:

```
http://localhost:5000
```

---

### 3️⃣ Start Frontend

```bash
cd ..
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔐 Authentication

> ⚠️ **For educational/demo purposes only**

* Uses **real ERP login credentials**
* Credentials are sent securely to the backend
* Backend maintains session cookies to scrape ERP data
* No credentials are stored permanently

---

## 🌍 Deployment

### Backend (Render)

* **Service Type**: Web Service
* **Root Directory**: `/api`
* **Build Command**:

  ```bash
  npm install
  ```
* **Start Command**:

  ```bash
  npm start
  ```

**Live Backend URL**

```
https://erp-wksy.onrender.com
```

---

### Frontend (Vercel)

* **Framework**: Vite
* **Build Command**:

  ```bash
  npm run build
  ```
* **Output Directory**:

  ```
  dist
  ```
* **Environment Variable**:

  ```
  VITE_BACKEND_URL=https://erp-wksy.onrender.com
  ```

---

## 📱 PWA Support

* Installable on Android, iOS, and Desktop
* Offline shell support
* Native-like experience via browser install

---

## ⚠️ Disclaimer

This project is intended for:

* Educational use
* UI/UX experimentation
* ERP modernization concepts

It is **not officially affiliated** with Loyola Academy or its ERP system.

---

## 📄 License

MIT License
Free to use for learning, experimentation, and UI prototyping.

```

---

If you want, next I can:
- Add **API endpoint documentation**
- Write a **DEPLOYMENT.md**
- Clean commits + tags for a **portfolio-ready repo**
- Convert this into a **case study README**

You actually built something solid here 👏
```
