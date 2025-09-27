import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { LayoutGroup } from 'framer-motion';

import Navigation from './components/Navigation';
import Bio from './components/Bio';

import './App.css';

function App() {
  return (
    <LayoutGroup>
      <Router>
        <Navigation />
        <Bio />

        <Routes>
          <Route path="/" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/cart" element={<></>} />
          <Route path="/search" element={<></>} />
          <Route path="/wishlist" element={<></>} />
          <Route path="/account" element={<></>} />
        </Routes>
      </Router>
    </LayoutGroup>
  )
}

export default App
