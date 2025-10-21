
import React, { useState } from 'react';
import { analyzeJournalEntry } from '../services/geminiService';

const moods = [
  { name: 'Happy', emoji: '😊' },
  { name: 'Calm', emoji: '😌' },
  { name: 'Okay', emoji: '😐' },
  { name: 'Anxious', emoji: '😟' },
  { name: 'Sad', emoji: '😢' },
];

const MoodJournal: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysis = async () => {
    if (!journalEntry.trim()) {
      setAnalysis("Please write something in your journal before analyzing.");
      return;
    }
    setIsLoading(true);
    setAnalysis('');
    const result = await analyzeJournalEntry(journalEntry);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
      <p className="text-gray-600 mb-6">Select a mood and write down your thoughts. Your journal is a private space for reflection.</p>

      <div className="flex justify-around items-center mb-6">
        {moods.map(mood => (
          <button
            key={mood.name}
            onClick={() => setSelectedMood(mood.name)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 w-20 ${
              selectedMood === mood.name ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'
            }`}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="mt-2 text-sm font-medium text-gray-700">{mood.name}</span>
          </button>
        ))}
      </div>

      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        rows={8}
        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="What's on your mind? The more you write, the better Neura can understand and help."
      ></textarea>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAnalysis}
          disabled={isLoading || !journalEntry}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Get AI Reflection'}
        </button>
      </div>

      {analysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">Neura's Reflection</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
};

export default MoodJournal;
