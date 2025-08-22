import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import MobileFrame from '@/components/MobileFrame';
import { authService } from '@/lib/auth';
import { db, Settings as SettingsType } from '@/lib/database';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [user, setUser] = useState(authService.getState().user);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    const unsubscribe = authService.subscribe((state) => {
      setUser(state.user);
      setNewUsername(state.user?.username || '');
    });
    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    try {
      let loadedSettings = await db.getSettings();
      if (!loadedSettings) {
        loadedSettings = {
          id: 'main',
          hybridMode: false,
          deviceVerified: false,
          lastUpdated: new Date()
        };
        await db.saveSettings(loadedSettings);
      }
      setSettings(loadedSettings);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const updateSettings = async (updates: Partial<SettingsType>) => {
    if (!settings) return;
    
    try {
      const updatedSettings = { ...settings, ...updates, lastUpdated: new Date() };
      await db.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const updateProfile = async () => {
    if (!user || !newUsername.trim()) {
      toast.error('Please enter a valid username');
      return;
    }

    try {
      await db.updateUser({ 
        username: newUsername.trim(),
        avatar: selectedAvatar || user.avatar
      });
      
      // Update auth state
      const updatedUser = await db.getUser();
      if (updatedUser) {
        authService.getState().user = updatedUser;
        setUser(updatedUser);
      }
      
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const verifyDeviceSecurity = async () => {
    toast.info('Checking device security...');
    
    // Simulate security check
    setTimeout(async () => {
      await updateSettings({ deviceVerified: true });
      toast.success('Device security verified! ✅');
    }, 2000);
  };

  const generateQRCode = () => {
    // Simulate QR code generation
    toast.success('QR code generated! Share with contacts to verify your identity.');
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200',
      'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-gray-200'
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  const avatarEmojis = ['👤', '🧑', '👩', '🧔', '👨', '🦸', '🎭', '🤖'];

  if (!user || !settings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 p-4 flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            ←
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-full ${getAvatarColor(user.username)} flex items-center justify-center text-2xl font-bold text-gray-700`}>
                {user.avatar || user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{user.username}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Edit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Avatar</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {avatarEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setSelectedAvatar(emoji)}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl hover:bg-gray-50 ${
                              selectedAvatar === emoji ? 'border-gray-900' : 'border-gray-200'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={updateProfile} className="w-full">
                      Save Changes
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Identity QR Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">📱</div>
              <h3 className="text-lg font-semibold text-gray-900">Your Identity QR</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Share this QR code with contacts to verify your identity
            </p>
            <Button onClick={generateQRCode} variant="outline" className="w-full">
              Generate QR Code
            </Button>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-gray-900">Enable Hybrid Mode</p>
                <p className="text-sm text-gray-600">Enhanced quantum-classical encryption</p>
              </div>
              <Switch
                checked={settings.hybridMode}
                onCheckedChange={(checked) => updateSettings({ hybridMode: checked })}
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">Device Security</p>
                  <p className="text-sm text-gray-600">
                    Status: {settings.deviceVerified ? '✅ Verified' : '❌ Not Verified'}
                  </p>
                </div>
              </div>
              <Button
                onClick={verifyDeviceSecurity}
                variant="outline"
                className="w-full"
                disabled={settings.deviceVerified}
              >
                {settings.deviceVerified ? 'Device Verified' : 'Verify Device Security'}
              </Button>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">ℹ️</div>
              <h3 className="text-lg font-semibold text-gray-900">About Quantum Security</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Learn more about our quantum-safe encryption technology and how it protects your communications.
            </p>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </div>

          {/* Sign Out */}
          <div className="pt-4">
            <Button
              onClick={() => authService.signOut()}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
  );
}