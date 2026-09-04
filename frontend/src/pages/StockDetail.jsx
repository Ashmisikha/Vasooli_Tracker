import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StockDetailView from '../components/stock/StockDetailView';

const StockDetail = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const symbol = props.symbol || params.symbol;

  return (
    <StockDetailView
      {...props}
      symbol={symbol}
      onBack={props.onBack || (() => navigate('/watchlist'))}
    />
  );
};

export default StockDetail;
