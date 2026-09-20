import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { RoomPage } from './pages/RoomPage';
import { ProfilePage } from './pages/ProfilePage';

import SnakeLadderAiView from './games/snake-ladder/SnakeLadderAiView';
import LudoAiView from './games/ludo/LudoAiView';
import UnoAiView from './games/uno/UnoAiView';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-game selection:bg-purple-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                <Route path="/create-room" element={<CreateRoomPage />} />
                <Route path="/join" element={<JoinRoomPage />} />
                <Route path="/join/:codeParam" element={<JoinRoomPage />} />
                <Route path="/room/:roomCode" element={<RoomPage />} />

                {/* AI Single Player Modes */}
                <Route path="/snake-ladder/ai" element={<SnakeLadderAiView />} />
                <Route path="/ludo/ai" element={<LudoAiView />} />
                <Route path="/uno/ai" element={<UnoAiView />} />

                <Route path="/profile" element={<ProfilePage />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
