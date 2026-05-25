import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('app_currency') || 'USD';
    });

    const [enableNotifications, setEnableNotifications] = useState(() => {
        const stored = localStorage.getItem('app_enable_notifications');
        return stored !== null ? JSON.parse(stored) : true;
    });

    useEffect(() => {
        localStorage.setItem('app_currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('app_enable_notifications', JSON.stringify(enableNotifications));
    }, [enableNotifications]);

    // Function to format price using the global currency setting
    const formatCurrency = (amount) => {
        const numericAmount = Number(amount) || 0;

        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(numericAmount);
        } catch (e) {
            // Fallback
            return `${currency} ${numericAmount.toFixed(2)}`;
        }
    };

    return (
        <SettingsContext.Provider value={{ currency, setCurrency, formatCurrency, enableNotifications, setEnableNotifications }}>
            {children}
        </SettingsContext.Provider>
    );
};
