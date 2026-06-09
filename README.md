# ChitrChatr - Premium Real-Time Chat Application

ChitrChatr is a full-stack, production-ready, highly scalable, and ultra-responsive real-time chat application. It is constructed using a robust stack featuring React.js (Vite), Node.js, Express, MySQL database, Sequelize ORM, and WebSocket connections via Socket.io.

The UI is optimized for responsiveness across all desktop and mobile viewports, featuring elegant glassmorphism aesthetics, class-based light/dark theme toggles, bouncing typing indicators, and immediate seen/read receipts.

---

## 🚀 Tech Stack

### Frontend Client
- **React.js** (Vite build engine)
- **Tailwind CSS** (Modern utility styling and class-based Dark Mode)
- **Lucide React** (Sharp vector iconography)
- **Axios** (Centralized client with authorization interceptors)
- **Socket.io Client** (Full-duplex WebSocket client)
- **React Router DOM** (Dynamic path mapping)

### Backend API Server
- **Node.js & Express.js** (REST API architecture)
- **MySQL & Sequelize ORM** (Relational schema modeling and connection pools)
- **Socket.io Server** (WebSocket message hub and event broadcasts)
- **BcryptJS** (Sequelize pre-save password encryption)
- **JSONWebToken** (Authorization token generation and verify middlewares)

---

## 🛠️ Project File Structure

```text
Chat_application/
  ├── client/                    # Frontend React Client
  │     ├── src/                 # React source code
  │     │     ├── components/    # Reusable UI widgets
  │     │     │     ├── Sidebar.jsx
  │     │     │     ├── UserCard.jsx
  │     │     │     ├── ChatHeader.jsx
  │     │     │     ├── ChatMessages.jsx
  │     │     │     ├── MessageBubble.jsx
  │     │     │     ├── MessageInput.jsx
  │     │     │     └── TypingIndicator.jsx
  │     │     ├── pages/          # Page templates
  │     │     │     ├── LoginPage.jsx
  │     │     │     ├── RegisterPage.jsx
  │     │     │     └── ChatDashboard.jsx
  │     │     ├── context/        # Global session states
  │     │     │     ├── AuthContext.jsx
  │     │     │     └── SocketContext.jsx
  │     │     ├── hooks/          # Custom hooks (useSocket)
  │     │     ├── services/       # Axios API config
  │     │     ├── routes/         # Secure path protectors
  │     │     ├── utils/          # Time & text formatters
  │     │     ├── main.jsx
  │     │     ├── App.jsx
  │     │     └── index.css      # Stylesheets & micro-animations
  │     ├── package.json
  │     ├── vite.config.js
  │     ├── tailwind.config.js
  │     ├── postcss.config.js
  │     └── index.html
  │
  ├── server/                    # Backend Node Server
  │     ├── config/              # Sequelize MySQL configs
  │     ├── controllers/         # REST API endpoints handlers
  │     ├── middleware/          # Security & Global error middleware
  │     ├── models/              # Schema definitions and associations
  │     ├── routes/              # Express endpoint bindings
  │     ├── sockets/             # Socket.io connection logic
  │     ├── .env                 # Server configurations
  │     ├── .env.example
  │     └── server.js            # Main entrypoint & MySQL bootstrapper
  │
  └── README.md                  # Project configuration guide
```

---

## ⚙️ Local Installation & Setup

### Prerequisites
- **Node.js** >= v16.x (v22.12.0 verified on host machine)
- **npm** >= v8.x (v11.4.2 verified on host machine)
- **MySQL Server** (Service running on standard port `3306` is verified as active)

---

### Step 1: Configure Environment Variables

1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Open the `.env` file (which is already created for you).
3. If your local MySQL service has a customized password, update the `DB_PASS` field:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASS=YOUR_MYSQL_PASSWORD_HERE
   DB_NAME=chat_application
   JWT_SECRET=yoursupersecurejwtsecretkeyforchat123
   CLIENT_URL=http://localhost:5173
   ```

*Note: The application has built-in auto-bootstrap logic. It will automatically connect to MySQL and execute `CREATE DATABASE IF NOT EXISTS chat_application` and sync all Sequelize models on start! You do not need to create tables manually.*

---

### Step 2: Start the Backend Server

Inside the `server/` directory, execute:
```bash
# Starts node server.js
npm start
```
The server will boot up, create the database if missing, sync your models, and listen for API and Socket requests on port `5000`.

---

### Step 3: Start the Frontend React Client

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to the displayed host URL, which defaults to: [http://localhost:5173](http://localhost:5173)

---

## ⚡ Real-Time WebSocket Protocols

The application manages communication via custom real-time events on Socket.io:

| Socket Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `connection` | Client ➔ Server | JWT Token (Auth Handshake) | Connects client, verifies JWT, sets `isOnline = true` in DB, broadcasts status update. |
| `join_chat` | Client ➔ Server | `conversationId` | Joins a WebSocket private room for message isolates. |
| `send_message` | Client ➔ Server | `{ conversationId, receiverId, message }` | Saves the message into MySQL, and relays to the active room. |
| `receive_message` | Server ➔ Client | Full Message Object (with profiles) | Delivers incoming message instantly. |
| `typing` | Client ➔ Server | `{ conversationId, receiverId }` | Emits active typing state, showing "... typing" to recipient. |
| `stop_typing` | Client ➔ Server | `{ conversationId, receiverId }` | Emits inactivity, clearing the typing indicator. |
| `message_seen` | Client ➔ Server | `{ conversationId, senderId }` | Sets `seen = true` in MySQL for messages in the active thread. |
| `messages_marked_seen` | Server ➔ Client | `{ conversationId, receiverId }` | Relays seen feedback to sender, turning tick badges blue instantly. |
| `disconnect` | Client ➔ Server | - | Removes mapping, sets `isOnline = false` in DB, broadcasts offline status. |

---

## 🛡️ Production & Scalability Best Practices

1. **Security & Hashing:** Password hashing uses `bcryptjs` via Sequelize model hook events. Never saves plain passwords.
2. **WebSockets Auth Guard:** Socket connection handshakes verify incoming JWT signatures before assigning resources. Unauthenticated connections are blocked.
3. **Debounced Socket State:** Typing notifications are debounced inside `MessageInput.jsx` to prevent flooding WebSocket connection packets.
4. **Relational Database Design:** Fully utilizes index keys on `senderId`, `receiverId`, and `conversationId` to ensure rapid queries when fetching thread logs.
5. **CORS Isolation:** Backend explicitly limits requests only to the designated `CLIENT_URL` origin for API and Socket handshakes.
