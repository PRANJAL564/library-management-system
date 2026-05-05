# 📚 Library Management System

A full-stack **Library Management System** built using **HTML, CSS, JavaScript, Node.js, Express, and MySQL**.
This application allows users to issue and return books, while admins can manage books, users, and view system analytics.

---

## 🚀 Features

### 👤 User Features

* User Registration & Login (JWT Authentication)
* View available books
* Issue books
* Return books
* View issued books
* View total fine

---

### 👑 Admin Features

* Dashboard with analytics

  * Total Books
  * Total Users
  * Issued Books
  * Returned Books
  * Total Fine
* Add, update, and delete books
* View all users
* Track issued books

---

## 🧠 Tech Stack

**Frontend:**

* HTML
* CSS
* JavaScript (Vanilla)

**Backend:**

* Node.js
* Express.js

**Database:**

* MySQL

**Authentication:**

* JSON Web Token (JWT)

---

## 📁 Project Structure

```
library-management-system/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── index.js
│
├── frontend/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/PRANJAL564/library-management-system.git
cd library-management-system
```

---

### 2️⃣ Install dependencies

```
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env` file:

```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the backend

```
npm start
```

Server runs on:

```
http://localhost:3000
```

---

### 5️⃣ Run frontend

Open:

```
frontend/login.html
```

---

## 🔗 API Endpoints

### 🔐 Auth

* POST /users/register
* POST /users/login

---

### 📚 Books

* GET /books
* POST /books (Admin)
* PUT /books/:id (Admin)
* DELETE /books/:id (Admin)

---

### 🔄 Issue System

* POST /issue
* PUT /issue/return/:id
* GET /issue/my
* GET /issue/fine

---

### 📊 Dashboard (Admin)

* GET /dashboard

---

## 🔐 Authentication

All protected routes require:

```
Authorization: Bearer <token>
```

---

## 🌐 Future Improvements

* Email notifications
* Real-time updates
* Pagination and search filters
* UI improvements

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.

---

## 🙌 Author

**Pranjal Sharma**
