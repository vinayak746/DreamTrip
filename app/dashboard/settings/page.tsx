'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getFirestoreDb } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiBell, FiMoon, FiSun, FiSettings } from 'react-icons/fi';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState('New York, USA');
  const [phone, setPhone] = useState('+1 (555) 123-4567');

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      try {
        const db = getFirestoreDb();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(userData.email || '');
          setPhone(userData.phone || '+1 (555) 123-4567');
          setLocation(userData.location || 'New York, USA');
          setDarkMode(userData.darkMode || false);
          setNotifications(userData.notifications !== false);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const db = getFirestoreDb();
      await updateDoc(doc(db, 'users', user.uid), {
        email,
        phone,
        location,
        darkMode,
        notifications,
        updatedAt: new Date()
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Account Settings</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
              <FiUser className="mr-2 text-indigo-600" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                  <FiMail className="mr-2 text-indigo-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                  <FiPhone className="mr-2 text-indigo-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
                <div className="flex items-center border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-colors">
                  <FiMapPin className="mr-2 text-indigo-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent outline-none dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Your location"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-300 dark:border-gray-600">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
              <FiSettings className="mr-2 text-indigo-600" />
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center">
                  {darkMode ? <FiMoon className="mr-2 text-indigo-500" /> : <FiSun className="mr-2 text-amber-500" />}
                  <span className="font-medium text-gray-800 dark:text-white">Dark Mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center">
                  <FiBell className={`mr-2 ${notifications ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <span className="font-medium text-gray-800 dark:text-white">Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiLock className="mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
