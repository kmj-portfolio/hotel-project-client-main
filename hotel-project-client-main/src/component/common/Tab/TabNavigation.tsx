import React from 'react';

export interface TabNavigationProps {
  tabs: Array<string>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const TabNavigation = React.memo(({ tabs, activeTab, onTabChange }: TabNavigationProps) => (
  <div className="mb-6 border-b border-gray-200">
    <div className="flex space-x-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`text-l cursor-pointer border-b-2 px-2 py-4 font-bold transition-colors ${
            activeTab === tab
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
));

export default TabNavigation;
