import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Welcome } from './pages/Welcome';
import { Wizard } from './pages/Wizard';
import { Editor } from './pages/Editor';
import { getUser } from './services/storage';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      try {
        const storedUser = await getUser();
        setUser(storedUser);
      } catch (error) {
        console.error("Failed to load user session", error);
      } finally {
        setIsLoading(false);
      }
    };
    initUser();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading application...</div>;

  return (
    <HashRouter>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/" element={user ? <Welcome /> : <Navigate to="/login" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <Wizard /> : <Navigate to="/login" />} />
          <Route path="/project/:id" element={user ? <Editor /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;