// hooks/useWatchlist.js
import { useState, useEffect, useCallback } from 'react';
import { watchlistApi } from '../services/api';

export const useWatchlist = (userId = 'default') => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch watchlist
    const fetchWatchlist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await watchlistApi.getWatchlist(userId);
            setWatchlist(response.watchlist || response.data || []);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message || 'Failed to fetch watchlist');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Add stock to watchlist
    const addStock = useCallback(async (symbol) => {
        try {
            setError(null);
            const response = await watchlistApi.addToWatchlist(symbol, userId);
            await fetchWatchlist(); // Refresh
            return response;
        } catch (err) {
            setError(err.message || 'Failed to add stock');
            throw err;
        }
    }, [userId, fetchWatchlist]);

    // Remove stock from watchlist
    const removeStock = useCallback(async (symbol) => {
        try {
            setError(null);
            const response = await watchlistApi.removeFromWatchlist(symbol, userId);
            await fetchWatchlist(); // Refresh
            return response;
        } catch (err) {
            setError(err.message || 'Failed to remove stock');
            throw err;
        }
    }, [userId, fetchWatchlist]);

    // Check if stock is in watchlist
    const isInWatchlist = useCallback(async (symbol) => {
        try {
            return await watchlistApi.checkInWatchlist(symbol, userId);
        } catch (err) {
            console.error('Error checking watchlist:', err);
            return false;
        }
    }, [userId]);

    // Initial load
    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);

    return {
        watchlist,
        loading,
        error,
        lastUpdated,
        fetchWatchlist,
        addStock,
        removeStock,
        isInWatchlist
    };
};
