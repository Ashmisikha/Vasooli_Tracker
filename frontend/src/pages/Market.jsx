import React from 'react';
import StockMarket from '../components/dashboard/StockMarket';

const Market = (props) => {
  return (
    <div>
      <StockMarket {...props} />
    </div>
  );
};

export default Market;

