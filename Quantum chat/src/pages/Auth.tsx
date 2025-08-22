import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import MobileFrame from '@/components/MobileFrame';
import { authService } from '@/lib/auth';

interface AuthProps {
  onComplete: () => void;
}

export default function Auth({ onComplete }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      let result;
      if (isSignUp) {
        result = await authService.signUp(email, password, username);
      } else {
        result = await authService.signIn(email, password);
      }

      clearInterval(interval);
      setProgress(100);

      if (result.success) {
        if (isSignUp) {
          setShowSuccess(true);
          setTimeout(() => {
            onComplete();
          }, 2000);
        } else {
          onComplete();
        }
      } else {
        toast.error(result.error);
        setProgress(0);
      }
    } catch (error) {
      clearInterval(interval);
      toast.error('Authentication failed');
      setProgress(0);
    }

    setIsLoading(false);
  };

  if (showSuccess) {
    return (
      <MobileFrame>
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="space-y-6">
            <div className="text-6xl">✅</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Secure ID Created!</h2>
              <p className="text-gray-600">Your quantum-safe identity has been generated</p>
            </div>
            <Button onClick={onComplete} className="w-full bg-gray-900 hover:bg-gray-800">
              Continue
            </Button>
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      <div className="h-full flex flex-col p-6">
        <div className="flex-1 flex flex-col justify-center space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-gray-600">
              {isSignUp ? 'Generate your secure quantum ID' : 'Access your secure account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Gmail Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-2 border-gray-200 focus:border-gray-400"
              />
              <p className="text-xs text-gray-500">Must be a valid Gmail address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl border-2 border-gray-200 focus:border-gray-400"
              />
              <p className="text-xs text-gray-500">
                Min 6 chars with uppercase, lowercase & number
              </p>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="rounded-xl border-2 border-gray-200 focus:border-gray-400"
                />
              </div>
            )}

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-center text-gray-600">
                  {isSignUp ? 'Generating your secure ID...' : 'Authenticating...'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl"
              size="lg"
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-gray-600 hover:text-gray-900 underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}