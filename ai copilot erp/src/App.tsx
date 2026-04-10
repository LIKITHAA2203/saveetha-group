import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFQs from './pages/RFQs';
import Quotes from './pages/Quotes';
import Inventory from './pages/Inventory';
import PurchaseOrders from './pages/PurchaseOrders';
import Finance from './pages/Finance';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Check if user exists in Firestore, if not create
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData;
          if (!userDoc.exists()) {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'jayalakshmi8806@gmail.com' ? 'admin' : 'procurement',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, userData);
          } else {
            userData = userDoc.data();
          }
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        // We don't throw here to avoid crashing the listener, 
        // but we might want to show an error state
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData: any) => {
    // This is now handled by onAuthStateChanged
  };

  const handleLogout = async () => {
    try {
      console.log('Attempting logout...');
      await signOut(auth);
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <DashboardLayout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/pos" element={<PurchaseOrders />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </ErrorBoundary>
  );
}
