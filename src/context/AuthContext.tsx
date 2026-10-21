import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { SubscriptionTier, UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  updateUserPlan: (newPlan: SubscriptionTier) => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_GUEST_PROFILE: UserProfile = {
  uid: 'demo-guest-user',
  email: 'demo@leadpilot.ai',
  displayName: 'LeadPilot Guest',
  plan: 'pro',
  leadCount: 8,
  outreachDraftCount: 3,
  createdAt: new Date().toISOString(),
  organizationName: 'Acme Growth Labs',
  icpPreferences: {
    targetIndustries: ['Digital Marketing & PPC', 'Software Development', 'Retail & E-Commerce'],
    minScoreThreshold: 75,
    defaultTone: 'consultative',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    // Validate connection to firestore on boot
    testConnection();

    // Check if guest session was active
    const savedGuest = localStorage.getItem('leadpilot_is_guest');
    if (savedGuest === 'true') {
      setIsGuest(true);
      const savedProfile = localStorage.getItem('leadpilot_guest_profile');
      setProfile(savedProfile ? JSON.parse(savedProfile) : DEMO_GUEST_PROFILE);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuest(false);
        localStorage.removeItem('leadpilot_is_guest');
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL || '',
              plan: 'free',
              leadCount: 0,
              outreachDraftCount: 0,
              createdAt: new Date().toISOString(),
              organizationName: `${user.displayName || 'My'} Workspace`,
              icpPreferences: {
                targetIndustries: ['Digital Marketing & PPC', 'Software Development'],
                minScoreThreshold: 70,
                defaultTone: 'professional',
              },
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        setCurrentUser(null);
        if (!isGuest) {
          setProfile(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
      localStorage.removeItem('leadpilot_is_guest');
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('leadpilot_is_guest', 'true');
    const guestProf = { ...DEMO_GUEST_PROFILE, createdAt: new Date().toISOString() };
    setProfile(guestProf);
    localStorage.setItem('leadpilot_guest_profile', JSON.stringify(guestProf));
    setIsLoading(false);
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem('leadpilot_is_guest');
      localStorage.removeItem('leadpilot_guest_profile');
      setProfile(null);
      setIsLoading(false);
      return;
    }
    try {
      await fbSignOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPlan = async (newPlan: SubscriptionTier) => {
    if (!profile) return;
    const updated = { ...profile, plan: newPlan };
    setProfile(updated);

    if (isGuest) {
      localStorage.setItem('leadpilot_guest_profile', JSON.stringify(updated));
      return;
    }

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, { plan: newPlan }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (isGuest) {
      localStorage.setItem('leadpilot_guest_profile', JSON.stringify(updated));
      return;
    }

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, updates, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        isLoading,
        isGuest,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateUserPlan,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
