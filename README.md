# ⏱️ TimeTrack – Browsing Activity Tracker (Task 4)

TimeTrack is a comprehensive browsing activity tracking system that monitors your web usage and provides detailed analytics through an intuitive dashboard.
This project was developed as **Task 4** during a **Full Stack Web Development Internship** to demonstrate Chrome extension development, REST API design, database architecture, real-time data visualization, and modern UI/UX practices.

---

## 📌 Internship Details

- **Company**: CODTECH IT SOLUTIONS  
- **Intern Name**: Mrudul Bokade  
- **Intern ID**: CTIS2677  
- **Domain**: Full Stack Web Development  
- **Duration**: 4 Weeks  
- **Mentor**: Neela Santosh  

---

## 🚀 Project Overview

TimeTrack is a complete productivity monitoring solution that tracks your browsing activity and categorizes websites as productive, unproductive, or neutral.
It enables **real-time session tracking**, **smart domain categorization**, **automatic syncing**, and **visual analytics** to help users understand their browsing habits.

The application focuses on:
- Real-time activity monitoring
- Intelligent categorization
- Data persistence and sync
- Visual analytics and insights
- User customization

---

## ✨ Features

### Core Features
- 🔍 Automatic tab tracking and session management
- 🎯 Smart domain categorization (100+ pre-configured sites)
- 📊 Comprehensive analytics dashboard with charts
- 🔄 Background sync every 5 minutes using Chrome Alarms
- 💾 Persistent data storage (Chrome Storage + MySQL)
- 🎨 User-customizable category overrides

### Dashboard Features
- 📈 Interactive charts (Bar, Doughnut, Line) using Chart.js
- 🌐 Top domains by time spent
- 📊 Category breakdown (Productive vs Unproductive)
- 📅 Daily activity trends
- 🕒 Time period selector (1/7/30 days)
- 🔄 Real-time refresh without cache issues

### Extension Features
- ⚡ Live session tracking with current domain display
- 🎨 Animated popup with Framer Motion
- 📱 Category editing directly from popup
- 🗑️ Clear data functionality
- 🆔 Device ID management
- 🌗 Dark theme UI

### Smart Categorization
- 🤖 Keyword-based detection (e.g., "docs", "learn" → productive)
- 🔗 TLD hints (.edu, .gov → productive)
- 📝 User override system with instant sync
- 🧠 Priority system: User > Known domains > Keywords > Neutral

---

## 🏗️ Project Architecture

```bash
task4-timetrack/
├── extension/                   # Chrome Extension (Manifest V3)
│   ├── manifest.json           
│   ├── background.js            
│   └── popup/                   # React popup UI
│
├── backend/                     # Express REST API
│   ├── server.js               
│   ├── db.js                    # MySQL connection pool
│   ├── schema.sql               # MySQL database schema
│   └── routes/
│
├── dashboard/                  # React Analytics Dashboard
│   ├── src/
│   │   ├── App.jsx             # Main dashboard with charts
│   │   └── api.js              # API service layer
│   ├── package.json
│   └── vite.config.js
│
├── .env.example                # Environment variables template
└── README.md
```

---

## 🧰 Tech Stack

### Chrome Extension
- Manifest V3
- React + Vite
- Chrome APIs
- Framer Motion (animations)
- Lucide React (icons)

### Backend
- Node.js + Express
- MySQL 8+ with connection pooling
- RESTful API design
- CORS enabled

### Dashboard
- React 18 + Vite
- Chart.js + react-chartjs-2
- Framer Motion for animations
- Lucide React icons
- CSS3 with gradient themes

### Database
- MySQL 8+
- mysql12 server

###
- Frontend: **Vercel**
- Backend: **Render**

---


## 📈 Learning Outcomes

- Chrome Extension development (Manifest V3)
- Service worker lifecycle and persistence
- Chrome Storage API and Alarms API
- REST API design and implementation
- MySQL database modeling with foreign keys
- Real-time data visualization with Chart.js
- Framer Motion animation library
- Cache control and optimization
- Full-stack integration (Extension → API → Database → Dashboard)
- Git workflow and version control
- Modern React patterns and hooks

---

## 📸 Output



---

## 📄 License

MIT
