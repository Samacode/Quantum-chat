import { Button } from '@/components/ui/button';

interface NavigationBarProps {
  currentScreen: string;
  onHomeClick: () => void;
  className?: string;
}

export default function NavigationBar({ currentScreen, onHomeClick, className = '' }: NavigationBarProps) {
  // Don't show navigation on welcome or auth screens
  if (currentScreen === 'welcome' || currentScreen === 'auth') {
    return null;
  }

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'contacts':
        return 'Contacts';
      case 'chat':
        return 'Chat';
      case 'verify':
        return 'Verify';
      case 'settings':
        return 'Settings';
      default:
        return 'QuantumSecure';
    }
  };

  const isHomeActive = currentScreen === 'contacts';

  return (
    <div className={`bg-white border-t border-gray-100 px-6 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Home button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onHomeClick}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            isHomeActive 
              ? 'bg-gray-900 text-white hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm font-medium">Home</span>
        </Button>
        
        {/* Center - Screen title */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-gray-700">{getScreenTitle()}</span>
          </div>
        </div>

        {/* Right side - Security indicator */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-1">
            <span className="text-green-600 text-sm">🔒</span>
            <span className="text-xs font-medium text-green-700">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}