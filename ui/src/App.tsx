import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Index from "./pages/Index";
import Proposal from "./pages/Proposal";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />

        <Route path="/proposal" element={<Proposal />} />
      </Routes>
    </Router>
  );
}

export default App;
