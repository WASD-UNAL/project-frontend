import React, { useState } from "react";
import LandingPage from "./components/landing/LandingPage";
import Login from "./components/auth/Login";

const App: React.FC = () => {
  const [showLogin, setShowLogin] = useState<boolean>(false);

  return (
    <main>
      <LandingPage onOpenLogin={() => setShowLogin(true)} />

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLogin(false)}
          />
          <div className="relative z-10 p-4">
            <Login inline onClose={() => setShowLogin(false)} />
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
