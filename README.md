# 🎲 GameRoom - Online Multiplayer Gaming Platform

**GameRoom** is a full-stack real-time online multiplayer platform built for friends to play **Snake & Ladder** and **Ludo** together seamlessly across desktop, laptop, tablet, and mobile browsers.

The system features **Server-Authoritative Game Synchronization** via Socket.IO, user authentication and persistent match stats via Supabase, room lobbies with 5-character room codes (`AB7KQ`), direct shareable invite links, in-room real-time chat, and reconnection handling.

---

## 🚀 Key Features

* **Multiplayer Games**:
  * 🎲 **Snake & Ladder**: 10x10 board (1-100), 2–4 players, exact roll to 100 rule, SVG snakes & ladders, staggered player tokens.
  * 🟢 **Ludo Online**: 2–4 players (Red, Green, Yellow, Blue), 4 tokens per player, 6-to-open rule, safe star tiles, token capturing, extra turns on 6 or capture, exact home path entry.
* **Server Authoritative**: All dice rolls, piece movements, captures, snake bites, ladder climbs, turn rotations, and victory declarations are calculated on the Node.js backend.
* **Room & Lobby System**:
  * Create public or private rooms with optional passwords and configurable max players (2-4).
  * Unique 5-character room codes (e.g. `AB7KQ`) and shareable invite links (`/join/AB7KQ`).
  * Real-time lobby sync with host controls, ready status toggles, and player color badges.
* **Reconnection Support**: Graceful 30-second disconnect grace window to re-attach players who temporarily lose connectivity without forfeiting matches.
* **Real-time Chat**: In-room chat with timestamps, sender username highlighting, and mobile drawer support.
* **Supabase Database & Auth**: User registration, login, profile management, and persistent match history tracking.
* **Modern Game UI**: Built with React, Vite, and Tailwind CSS. Responsive layout optimized for mobile and desktop screens with confetti victory animations.

---

## 🛠️ Technology Stack

* **Frontend**:
  * React 18
  * Vite
  * JavaScript (ES Modules)
  * Tailwind CSS
  * Lucide React Icons
  * Socket.IO Client
  * `@supabase/supabase-js`
  * `canvas-confetti`
  * React Router DOM v6
* **Backend**:
  * Node.js & Express
  * Socket.IO
  * `@supabase/supabase-js`
  * Vitest (Automated Engine Tests)
* **Database & Auth**:
  * Supabase PostgreSQL
  * Supabase Auth

---

## 📁 Monorepo Folder Structure

```
game-room/
├── README.md                  # Detailed project documentation
├── supabase_schema.sql        # Supabase PostgreSQL database schema script
├── server/                    # Express + Socket.IO Backend Server
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── config/
│   │   │   └── supabase.js    # Supabase server client
│   │   ├── utils/
│   │   │   └── codeGenerator.js # Room code generator
│   │   ├── games/
│   │   │   ├── GameRoom.js    # Room state manager
│   │   │   ├── SnakeLadderGame.js # Authoritative Snake & Ladder engine
│   │   │   └── LudoGame.js    # Authoritative Ludo engine
│   │   ├── services/
│   │   │   └── matchHistoryService.js # Match history saver
│   │   └── socket/
│   │       ├── index.js       # Socket IO setup
│   │       ├── roomHandler.js # Room events handler
│   │       ├── gameHandler.js # Dice & Move events handler
│   │       └── chatHandler.js # Chat handler
│   └── tests/                 # Server Unit Tests
│       ├── snakeLadder.test.js
│       └── ludo.test.js
└── client/                    # Vite + React Frontend Client
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx # Supabase auth & guest mode state
        │   └── SocketContext.jsx # Real-time socket sync manager
        ├── services/
        │   └── supabase.js    # Supabase frontend client
        ├── components/        # Reusable UI components
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ChatWidget.jsx
        │   ├── DiceRoller.jsx
        │   ├── PlayerAvatar.jsx
        │   └── ProtectedRoute.jsx
        ├── pages/             # App pages
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── CreateRoomPage.jsx
        │   ├── JoinRoomPage.jsx
        │   └── RoomPage.jsx   # Lobby & Active Game container
        └── games/             # Visual Game Boards & Views
            ├── snake-ladder/
            │   ├── Board.jsx
            │   └── SnakeLadderView.jsx
            └── ludo/
                ├── Board.jsx
                └── LudoView.jsx
```

---

## 🔑 Environment Variables

### 1. Backend Server (`server/.env`)
```env
PORT=3001
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Frontend Client (`client/.env`)
```env
VITE_SERVER_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📦 Installation & Quick Start

### 1. Prerequisites
* Node.js v18+ and npm installed.

### 2. Backend Setup & Test Execution
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Run automated engine unit tests
npm test

# Start backend server in watch mode
npm run dev
```
The server will run on `http://localhost:3001`.

### 3. Frontend Setup & Execution
```bash
# Open a new terminal and navigate to client folder
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The client website will open on `http://localhost:5173`.

---

## 🗄️ Supabase Setup Instructions

1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Open `supabase_schema.sql` located at the root of this repo.
4. Copy and execute the contents in the SQL Editor.
5. Copy your Project URL, Public Anon Key, and Service Role Key into `client/.env` and `server/.env`.

---

## 🎮 How to Create and Join a Room

1. **Host Player**:
   - Click **Create Room** on the home page.
   - Choose game type (**Snake & Ladder** or **Ludo**).
   - Configure max players (2-4) and optional privacy password.
   - Click **Create Room**. You will land in the lobby with a 5-character Room Code (e.g., `AB7KQ`).
2. **Friend(s)**:
   - Option A: Enter the 5-character Room Code on the **Join Room** page.
   - Option B: Click the shareable invite link copied by the host (`/join/AB7KQ`).
3. **Lobby & Game Start**:
   - Players appear live in the lobby and toggle **Ready**.
   - Host clicks **Start Game** once at least 2 players are present and ready!
