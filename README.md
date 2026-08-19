# 🌍 Tour API

A **REST API** project developed using Node.js, Express, and MongoDB to manage tour operations and user authentication.

---

## 🚀 Key Features

* **Authentication & Authorization:** Secure login/logout system powered by JWT and cookies.
* **Password Security:** Password hashing using `bcrypt`.
* **Security Practices:** HTTP header security (`helmet`), rate limiting (`express-rate-limit`), and `cors` support.
* **File Upload & Image Processing:** Multipart form-data handling using `multer` and image optimization/resizing via `sharp`.
* **Data Validation & Parsing:** Schema-based input validation using `zod` and advanced query string parsing via `qs`.
* **Email Service:** `nodemailer` and `mailtrap` integration for password resets and email notifications.
* **Data Management:** Flexible database architecture with MongoDB and Mongoose.

---

## 🛠️ Tech Stack

* **Node.js & Express** (ES Modules - `import/export`)
* **MongoDB & Mongoose**
* **JWT, Bcrypt, Helmet, Express-Rate-Limit**
* **Multer, Sharp**
* **Zod, Validator, Qs**
* **Nodemailer, Mailtrap**

---

## 📂 Project Setup & Folder Structure

Before running the application, ensure the required upload directories exist in the project root to prevent file handling errors during avatar or media uploads:

```bash
mkdir -p uploads/users
```

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
NODE_ENV=development
EMAIL_TOKEN=your_email_token
```

**3. Seed Sample Data (Optional):**
A pre-configured development dataset is available in `src/dev-data/`. You can populate or clear your MongoDB database using the following commands:

```bash
# Import sample data into MongoDB
npm run import

# Clear all sample data from MongoDB
npm run clear
```

**4. Run the application:**
```bash
npm run dev
```

---

## 🧪 API Testing & Documentation

A ready-to-use Postman collection is included in the project root directory:

* **File:** `tours-api.postman_collection.json`

Import this file directly into **Postman** to quickly test authentication, user management, tour operations, and image upload endpoints.

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
