import React from 'react';
import { FaBars } from 'react-icons/fa';
import Product from './pages/Product';
import Home from './pages/Home';
import Transactions from './pages/Transactions';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const Main = ({
  handleToggleSidebar,
}) => {
  return (
    <main>
      <div className="btn-toggle" onClick={() => handleToggleSidebar(true)}>
        <FaBars />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/product" element={<Product />}></Route>
          <Route path="/transactions" element={<Transactions />}></Route>

        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default Main;