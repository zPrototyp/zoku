
import React from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Layout from "./Components/Layout";
import AboutZoku from "./Pages/AboutZoku";
import Tribes from "./Pages/Tribes";
import AboutUs from "./Pages/AboutUs";
import Login from "./Pages/Login";
import FeedPage from "./Pages/FeedPage";
import Register from "./Pages/RegisterPage";
import ResultPage from "./Pages/ResultPage";
import ProfilePage from "./Pages/ProfilePage";
import ClearAllAtoms from "./Pages/ClearAllAtoms";
import CommunityPage from "./Pages/CommunityPage";
import TestPage from "./Pages/ComboTestPage";
import NewStartPage from "./Pages/NewStartPage";
import './assets/css/App.css'; 
import AdminPage from "./Pages/AdminPage";

function App() { 
  return (
   
    // <Router basename="/zoku">
    <Router>
    
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<NewStartPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/result" element={<ResultPage/>} />

          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/community" element={<CommunityPage />} />

          <Route path="/aboutZoku" element={<AboutZoku />} />
          <Route path="/tribes" element={<Tribes />} />
          <Route path="/aboutUs" element={<AboutUs />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>} />

          <Route path="/clear" element={<ClearAllAtoms />} />
        
        {/* <Route path="brand/{brandId}" element={<BrandPage brandId={brandId} />} /> */}
        
        </Route>
        {/* Admin page not within the site Layout */}
        <Route path="/admin" element={<AdminPage />} />

      </Routes>
    </Router>
  );
}

export default App
