import React from 'react';
import './Greeting.css';

export const Greeting: React.FC = () => {
  return (
    <div className="greeting-container animate-slide-up">
      <h2 className="greeting-title text-primary">Hello, Warkari 🙏</h2>
      <p className="greeting-subtitle text-secondary">
        We are here to help you on your Wari.
      </p>
    </div>
  );
};
