
import React from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import TestPage from "./Pages/TestPage";
import StartPage from "./Pages/StartPage";
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
import './assets/css/App.css'; 

function App() { 
  return (
   
    // <Router basename="/zoku">
    <Router>
    
      <Routes>
        <Route element={<Layout />}>
          <Route path="/test" element={<TestPage />} />
          <Route path="/" element={<StartPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/aboutZoku" element={<AboutZoku />} />
          <Route path="/tribes" element={<Tribes />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/result" element={<ResultPage/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/clear" element={<ClearAllAtoms />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
