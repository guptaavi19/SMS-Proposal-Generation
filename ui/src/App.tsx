import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Index from "./pages/Index";
import Proposal from "./pages/Proposal";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/proposals/:id" element={<Proposal />} />
        </Routes>
      </Router>
      <Toaster richColors theme="light" position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
