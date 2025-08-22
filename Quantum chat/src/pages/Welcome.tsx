import { Button } from '@/components/ui/button';
import MobileFrame from '@/components/MobileFrame';

interface WelcomeProps {
  onGetStarted: () => void;
}

export default function Welcome({ onGetStarted }: WelcomeProps) {
  return (
    <MobileFrame>
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              QuantumSecure Chat
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-sm">
              Protect your messages with next-gen quantum-safe encryption
            </p>
          </div>
          
          <div className="pt-8">
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="w-full py-4 text-lg font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}