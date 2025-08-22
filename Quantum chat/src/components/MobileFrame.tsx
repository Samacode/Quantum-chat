import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
  className?: string;
  showNavigation?: boolean;
  navigationBar?: ReactNode;
}

export default function MobileFrame({ children, className = '', showNavigation = false, navigationBar }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-300 ${className}`}>
        <div className="bg-black h-6 relative">
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-full"></div>
        </div>
        <div className="min-h-[800px] bg-white relative flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          {showNavigation && navigationBar}
        </div>
        <div className="h-2 bg-black"></div>
      </div>
    </div>
  );
}