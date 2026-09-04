import React from 'react';
import PortfolioStats from './PortfolioStats';

export default function Dashboard({ summary }) {
  return (
    <div className="space-y-6">
      <PortfolioStats summary={summary} />
    </div>
  );
}
