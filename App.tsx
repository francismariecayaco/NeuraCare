
import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import LiveConversation from './components/LiveConversation';
import MoodJournal from './components/MoodJournal';
import Resources from './components/Resources';
import { View } from './types';

const Welcome: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to NeuraCare</h2>
        <p className="text-gray-600 mb-6 text-lg">Your personal space for mental wellness. Here, you can talk through your feelings with an AI companion, track your mood in a private journal, or find helpful resources.</p>
        <p className="text-gray-500">Use the menu on the left to get started.</p>
    </div>
)

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);

  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Welcome />;
      case View.CONVERSE:
        return <LiveConversation />;
      case View.JOURNAL:
        return <MoodJournal />;
      case View.RESOURCES:
        return <Resources />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 ml-64 p-8">
          {renderContent()}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;
