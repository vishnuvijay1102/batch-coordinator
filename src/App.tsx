import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Classrooms from './components/Classrooms';
import Batches from './components/Batches';
import Teachers from './components/Teachers';
import Schedule from './components/Schedule';
import Database from './components/Database';
import Students from './components/Students';
import Courses from './components/Courses';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MockDetails from './components/MockDetails';

import { AppProvider } from './context/AppContext';

function Layout() {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classrooms" element={<Classrooms />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/students" element={<Students />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/mock-details" element={<MockDetails />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/database" element={<Database />} />
            <Route path="/reports" element={<div className="p-10 text-2xl font-bold">Reports View (Coming Soon)</div>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/support" element={<div className="p-10 text-2xl font-bold">Support View (Coming Soon)</div>} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
