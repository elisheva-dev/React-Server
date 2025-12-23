## 🚀 Backend API

The server is built with **Node.js** and **Express**. It handles authentication, business details, services, and appointments.

### 📌 API Endpoints

#### Login

- **POST** `/login`
- Body example:
```json
{
  "name": "admin",
  "password": "123456"
}
```
### 🔑 Authentication

**Login Endpoint**

- **POST** `/login`
- Response:
  - `200 OK` – Login success
  - `401 Unauthorized` – Login failed

---

### 🏢 Business Details

- **GET** `/businessData` – Get business details
- **POST** `/businessData` – Add new business details
- **PUT** `/businessData` – Update business details

---

### 🛎 Services

- **GET** `/services` – Get all services
- **POST** `/service` – Add a new service  
  - Checks if service already exists

---

### 📅 Appointments / Meetings

- **GET** `/appointments` – Get all appointments
- **POST** `/appointment` – Add a new appointment  
  - Checks if the date and time is available

---

### ⚙️ Run the Server

```bash
npm install
node server.js
```

The server runs by default on port 8787 or process.env.PORT.
