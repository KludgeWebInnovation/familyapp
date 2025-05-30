import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Meals from './pages/Meals';
import Tasks from './pages/Tasks';
import Finance from './pages/Finance';
import IntakeChat from './pages/IntakeChat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import supabase from './lib/supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} handleLogout={handleLogout} />
      <main className="flex-grow container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/meals"
            element={user ? <Meals /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/tasks"
            element={user ? <Tasks /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/finance"
            element={user ? <Finance /> : <Navigate to="/login" replace />}
          />
          <Route path="/intake" element={<IntakeChat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
