
import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { view: View.HOME, label: 'Home', icon: 'home' as const },
    { view: View.CONVERSE, label: 'Talk with Neura', icon: 'microphone' as const },
    { view: View.JOURNAL, label: 'Mood Journal', icon: 'journal' as const },
    { view: View.RESOURCES, label: 'Resources', icon: 'resources' as const },
  ];

  return (
    <aside className="w-64 bg-white p-4 space-y-2 h-full fixed top-16 left-0">
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.view}>
              <button
                onClick={() => onViewChange(item.view)}
                className={`flex items-center w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                  currentView === item.view
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon name={item.icon} className="w-6 h-6 mr-3" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
