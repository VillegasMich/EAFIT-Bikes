import { Outlet } from "react-router";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
