import React from "react";

const StartScreen: React.FC<{ onContinue: () => void }> = ({ onContinue }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
    <div className="max-w-md w-full mx-auto text-center">
      <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Movie Match</h1>
      <p className="text-lg mb-8 text-muted-foreground">Find movies you love, together.</p>
      <button
        className="w-full py-4 px-6 rounded-lg bg-primary text-white text-lg font-semibold shadow transition hover:bg-primary/90"
        onClick={onContinue}
      >
        Get Started
      </button>
    </div>
  </div>
);

export default StartScreen;
