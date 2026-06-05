# 💪 GymTrack

تطبيق تتبع التمارين - Node.js + Express + MongoDB + HTML/CSS/JS

---

## 🗂️ هيكل المشروع

```
gymtrack/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Day.js
│   │   └── Exercise.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── days.js
│   │   └── exercises.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    └── index.html
```

---

## ⚙️ متطلبات التشغيل

- **Node.js** v18+  →  https://nodejs.org
- **MongoDB** مثبت ومشغل على جهازك  →  https://www.mongodb.com/try/download/community

---

## 🚀 خطوات التشغيل

### 1️⃣ تأكد إن MongoDB شغال

**Windows:**
```
net start MongoDB
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# أو
sudo systemctl start mongod
```

---

### 2️⃣ ثبت الـ packages

```bash
cd backend
npm install
```

---

### 3️⃣ شغل السيرفر

```bash
npm run dev
```

أو لو مش عندك nodemon:

```bash
npm start
```

---

### 4️⃣ افتح المتصفح

```
http://localhost:5000
```

---

## ✨ Features

- ✅ Register / Login بـ JWT
- ✅ Welcome بالاسم بعد الدخول
- ✅ أنشئ أيام تمارين بأسماء حسب اختيارك
- ✅ أضف تمارين لكل يوم مع Sets / Reps / Weight
- ✅ عدّل أو احذف أي تمرين أو يوم
- ✅ Dashboard مع إجمالي الأوزان والتمارين
- ✅ Progress لكل تمرين (Max weight, Avg reps, Volume)
- ✅ History لكل التمارين المسجلة
- ✅ تصميم بنفسجي + أسود مع ambient glow

---

## 🔧 تعديل الـ .env

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gymtrack
JWT_SECRET=غيّر_الكلمة_دي_لحاجة_سرية
```
