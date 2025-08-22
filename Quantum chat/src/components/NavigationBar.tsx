import { Button } from '@/components/ui/button';
import { authService } from '@/lib/auth';

interface NavigationBarProps {
  currentScreen: string;
  onHomeClick: () => void;
  className?: string;
}

export default function NavigationBar({ currentScreen, onHomeClick, className = '' }: NavigationBarProps) {
  const handleSignOut = async () => {
    await authService.signOut();
  };

  // Don't show navigation on welcome or auth screens
  if (currentScreen === 'welcome' || currentScreen === 'auth') {
    return null;
  }

  return (
    <div className={`bg-white border-t border-gray-200 p-2 flex justify-between items-center ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onHomeClick}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
      >
        <span className="text-lg">🏠</span>
        <span className="text-sm font-medium">Home</span>
      </Button>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-gray-500">
          <span className="text-green-500 text-sm">🔒</span>
          <span className="text-xs">Secure</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
        >
          <span className="text-lg">🚪</span>
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}