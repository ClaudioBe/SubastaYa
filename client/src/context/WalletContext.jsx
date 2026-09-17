import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const WalletContext = createContext(null);

const emptyBalance = { total_balance: 0, withheld_balance: 0, available_balance: 0 };

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(emptyBalance);
  const [loading, setLoading] = useState(false);
  const [hasWallet, setHasWallet] = useState(true);

  const refreshBalance = useCallback(async () => {
    if (!user) {
      setBalance(emptyBalance);
      setHasWallet(true);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get('wallets/balance', { params: { userId: user.id } });
      setBalance(response.data);
      setHasWallet(true);
    } catch (err) {
      setBalance(emptyBalance);
      setHasWallet(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const deposit = async (amount) => {
    const response = await axios.post('wallets/deposit', { userId: user.id, amount });
    setBalance(response.data);
    setHasWallet(true);
    return response.data;
  };

  return (
    <WalletContext.Provider value={{ balance, loading, hasWallet, refreshBalance, deposit }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
