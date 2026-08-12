# 🌍 Tour API

A **REST API** project developed using Node.js, Express, and MongoDB to manage tour operations and user authentication.

---

## 🚀 Key Features

* **Authentication & Authorization:** Secure login/logout system powered by JWT and cookies.
* **Password Security:** Password hashing using `bcrypt`.
* **Security Practices:** HTTP header security (`helmet`), rate limiting (`express-rate-limit`), and `cors` support.
* **Data Validation & Parsing:** Schema-based input validation using `zod` and advanced query string parsing via `qs`.
* **Email Service:** `nodemailer` and `mailtrap` integration for password resets and email notifications.
* **Data Management:** Flexible database architecture with MongoDB and Mongoose.

---

## 🛠️ Tech Stack

* **Node.js & Express** (ES Modules - `import/export`)
* **MongoDB & Mongoose**
* **JWT, Bcrypt, Helmet, Express-Rate-Limit**
* **Zod, Validator, Qs**
* **Nodemailer, Mailtrap**

---

## 💻 Installation & Setup

**1. Install dependencies:**
```bash
npm install
```

**2. Create a `.env` file:**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**3. Run the application:**
```bash
npm run dev
```

---

## 📌 Essential MongoDB Commands

| Command | Description |
| :--- | :--- |
| `insertOne(doc)` / `insertMany(docs)` | Insert document(s) |
| `find(filter)` / `findOne(filter)` | Query/Find document(s) |
| `updateOne(filter, update)` / `updateMany(filter, update)` | Update document(s) |
| `deleteOne(filter)` / `deleteMany(filter)` | Delete document(s) |

---

## 👤 Author

**Habibe Bulut Mutlu**  
✉️ Email: habibe.ce1996@gmail.com

---

## 📜 License

This project is licensed under the **ISC License**.  
Copyright (c) 2026 **Habibe Bulut Mutlu <habibe.ce1996@gmail.com>**
