
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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
import CompareProfilesPage from "./Pages/CompareProfilesPage";
import FBShareProfiles from "./Pages/FBShareProfiles";

function App() { 
  return (
    <RouterBrowswer basename={process.env.PUBLIC_URL}>
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
          <Route path="/compare" element={<CompareProfilesPage />}/>
          
        {/* Routes to share to fb - one per personality */}
        <Route path="/share/:profile/:changeY/:compassionX" element={<FBShareProfiles />} />

        </Route>
      </Routes>
    </RouterBrowswer>
  );
}

export default App
