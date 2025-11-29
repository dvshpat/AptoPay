'use client'
import { useState, useEffect, useRef } from 'react';
import WelcomeSection from '@/components/WelcomeSection';
import ActionCards from '@/components/ActionCards';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export default function Home() {
  const { account, connected } = useWallet();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const hasCheckedUser = useRef(false);

  const fetchCurrentUser = async () => {
    if (!account?.address || !connected || hasCheckedUser.current) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      if (data.success) {
        const user = data.users.find((u: any) => u.walletAddress.toLowerCase() === account?.address.toString());
        setCurrentUser(user);
        hasCheckedUser.current = true;
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected && account?.address && !hasCheckedUser.current) {
      fetchCurrentUser();
    }
  }, [connected, account?.address]);

  return (
    <div className=''>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <WelcomeSection />
        <ActionCards />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
