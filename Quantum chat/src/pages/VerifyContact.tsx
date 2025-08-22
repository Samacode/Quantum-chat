import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MobileFrame from '@/components/MobileFrame';
import { db, Contact } from '@/lib/database';

interface VerifyContactProps {
  contact: Contact;
  onVerified: (contact: Contact) => void;
  onBack: () => void;
}

export default function VerifyContact({ contact, onVerified, onBack }: VerifyContactProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleScanQR = () => {
    setIsScanning(true);
    // Simulate QR code scanning
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);
      toast.success('QR Code scanned successfully!');
    }, 2000);
  };

  const handleVerifyContact = async () => {
    try {
      const updatedContact = { ...contact, verified: true };
      await db.saveContact(updatedContact);
      toast.success('Contact verified successfully!');
      onVerified(updatedContact);
    } catch (error) {
      toast.error('Failed to verify contact');
    }
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200',
      'bg-purple-200', 'bg-pink-200', 'bg-indigo-200', 'bg-gray-200'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 p-4 flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            ←
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Verify Contact</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-2xl font-bold text-gray-700 mx-auto`}>
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
            <p className="text-gray-600">@{contact.username}</p>
          </div>

          <div className="w-full space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl">📱</div>
              <Button
                onClick={handleScanQR}
                disabled={isScanning}
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 hover:border-gray-400"
              >
                {isScanning ? 'Scanning...' : 'Scan QR Code'}
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 font-semibold">Safety Number</p>
              <div className="bg-gray-100 p-4 rounded-xl">
                <p className="font-mono text-lg text-gray-900 tracking-wider">
                  {contact.safetyNumber}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Compare this number with your contact to verify identity
              </p>
            </div>

            {isVerified && (
              <div className="text-center space-y-4">
                <div className="text-6xl">✅</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-600">Contact Verified!</h3>
                  <p className="text-gray-600">This contact's identity has been confirmed</p>
                </div>
                <Button
                  onClick={handleVerifyContact}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Start Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}