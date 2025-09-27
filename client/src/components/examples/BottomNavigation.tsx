import { useState } from 'react';
import BottomNavigation, { type NavTab } from '../BottomNavigation';

export default function BottomNavigationExample() {
  const [activeTab, setActiveTab] = useState<NavTab>('map');

  return (
    <div className="h-24">
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        duplicateCount={23}
        savingsAmount={156}
      />
    </div>
  );
}