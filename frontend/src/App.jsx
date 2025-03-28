import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import About from "./pages/About";
import Contact from "./pages/Contact/Contact";
import Navbar from "./components/Navbar";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <Router>
      <Navbar />
      <ThemeToggle/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
