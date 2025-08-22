import { useState, useEffect } from 'react';
import { authService, AuthState } from '@/lib/auth';
import { Contact } from '@/lib/database';
import NavigationBar from '@/components/NavigationBar';
import Welcome from './Welcome';
import Auth from './Auth';
import Contacts from './Contacts';
import VerifyContact from './VerifyContact';
import Chat from './Chat';
import Settings from './Settings';

type Screen = 'welcome' | 'auth' | 'contacts' | 'verify' | 'chat' | 'settings';

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    authService.init();
    const unsubscribe = authService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) {
      setCurrentScreen('contacts');
    } else {
      setCurrentScreen('welcome');
    }
  }, [authState.isAuthenticated]);

  const handleGetStarted = () => {
    setCurrentScreen('auth');
  };

  const handleAuthComplete = () => {
    setCurrentScreen('contacts');
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentScreen('chat');
  };

  const handleVerifyContact = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentScreen('verify');
  };

  const handleContactVerified = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentScreen('chat');
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
    setCurrentScreen('contacts');
  };

  const handleOpenSettings = () => {
    setCurrentScreen('settings');
  };

  const handleHomeClick = () => {
    setSelectedContact(null);
    setCurrentScreen('contacts');
  };

  const renderScreen = () => {
    const navigationBar = (
      <NavigationBar
        currentScreen={currentScreen}
        onHomeClick={handleHomeClick}
      />
    );

    const screenContent = (() => {
      switch (currentScreen) {
        case 'welcome':
          return <Welcome onGetStarted={handleGetStarted} />;
        
        case 'auth':
          return <Auth onComplete={handleAuthComplete} />;
        
        case 'contacts':
          return (
            <div className="relative h-full">
              <Contacts
                onContactSelect={handleContactSelect}
                onVerifyContact={handleVerifyContact}
              />
              <button
                onClick={handleOpenSettings}
                className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 text-2xl z-10"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
          );
        
        case 'verify':
          return selectedContact ? (
            <VerifyContact
              contact={selectedContact}
              onVerified={handleContactVerified}
              onBack={handleBackToContacts}
            />
          ) : null;
        
        case 'chat':
          return selectedContact ? (
            <Chat
              contact={selectedContact}
              onBack={handleBackToContacts}
            />
          ) : null;
        
        case 'settings':
          return <Settings onBack={handleBackToContacts} />;
        
        default:
          return <Welcome onGetStarted={handleGetStarted} />;
      }
    })();

    // For screens that need their own mobile frame (Welcome, Auth)
    if (currentScreen === 'welcome' || currentScreen === 'auth') {
      return screenContent;
    }

    // For app screens with navigation
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-300">
          <div className="bg-black h-6 relative">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-full"></div>
          </div>
          <div className="min-h-[800px] bg-white relative flex flex-col">
            <div className="flex-1 overflow-hidden">
              {screenContent}
            </div>
            {navigationBar}
          </div>
          <div className="h-2 bg-black"></div>
        </div>
      </div>
    );
  };

  return renderScreen();
}