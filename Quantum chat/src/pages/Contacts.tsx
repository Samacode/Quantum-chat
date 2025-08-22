import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import MobileFrame from '@/components/MobileFrame';
import { db, Contact } from '@/lib/database';

interface ContactsProps {
  onContactSelect: (contact: Contact) => void;
  onVerifyContact: (contact: Contact) => void;
}

export default function Contacts({ onContactSelect, onVerifyContact }: ContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactUsername, setNewContactUsername] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const loadedContacts = await db.getContacts();
      setContacts(loadedContacts);
    } catch (error) {
      toast.error('Failed to load contacts');
    }
  };

  const generateSafetyNumber = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = [];
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      segments.push(segment);
    }
    return segments.join('-');
  };

  const addContact = async () => {
    if (!newContactName.trim() || !newContactUsername.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const newContact: Contact = {
        id: crypto.randomUUID(),
        name: newContactName.trim(),
        username: newContactUsername.trim(),
        verified: false,
        safetyNumber: generateSafetyNumber(),
        addedAt: new Date()
      };

      await db.saveContact(newContact);
      setContacts(prev => [...prev, newContact]);
      setNewContactName('');
      setNewContactUsername('');
      setIsAddDialogOpen(false);
      toast.success('Contact added successfully');
    } catch (error) {
      toast.error('Failed to add contact');
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      await db.deleteContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact deleted');
    } catch (error) {
      toast.error('Failed to delete contact');
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
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Contacts</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacts Yet</h3>
              <p className="text-gray-600">Add your first secure contact to start chatting</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center text-gray-700 font-semibold mr-4`}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <div className={`text-xl ${contact.verified ? 'text-green-500' : 'text-gray-400'}`}>
                        🛡️
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">@{contact.username}</p>
                    <p className="text-xs text-gray-500">
                      {contact.verified ? 'Verified' : 'Not verified'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => contact.verified ? onContactSelect(contact) : onVerifyContact(contact)}
                      className="text-xs"
                    >
                      {contact.verified ? 'Chat' : 'Verify'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteContact(contact.id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl" size="lg">
                + Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter contact name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={newContactUsername}
                    onChange={(e) => setNewContactUsername(e.target.value)}
                  />
                </div>
                <Button onClick={addContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
  );
}