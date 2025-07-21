import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
// import { useDoctorAuth } from '@/hooks/useDoctorAuth';

interface Message {
  _id: string;
  patienName: string;
  patienEmail: string;
  Messges: string;
  body: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

// Sample messages used when API data isn't available
const sampleMessages: Message[] = [
  {
    _id: '1',
    patienName: 'John Doe',
    patienEmail: 'john@example.com',
    Messges: 'Need advice on medication',
    body: 'Hello doctor, I would like to know if I can continue the medication you prescribed last month or if I should adjust the dosage.',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    patienName: 'Jane Smith',
    patienEmail: 'jane.smith@example.com',
    Messges: 'Follow-up appointment',
    body: 'Dear doctor, could we schedule a follow-up appointment next week? The pain has subsided but I would like to be sure.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: '3',
    patienName: 'Michael Lee',
    patienEmail: 'michael.lee@example.com',
    Messges: 'Lab results inquiry',
    body: 'Hi doctor, have my recent lab results come in? I am anxious to know if everything is normal.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const Inbox: React.FC = () => {
  const { currentDoctor } = useDoctorAuth();
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const { toast } = useToast();

  useEffect(() => {
    // Replace with real API endpoint
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/getAllmessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ doctorEmail: currentDoctor?.contactInfo?.email }),
        });
        const data = await response.json();
        setMessages(data.allMessges as Message[]);
      } catch (error) {
        // Demo fallback
        setMessages(sampleMessages);

      }
    };

    fetchMessages();
  }, []);

  const handleReply = (email: string, subject: string) => {
    const mailto = `mailto:${email}?subject=${encodeURIComponent('Re: ' + subject)}`;
    window.location.href = mailto;
    toast({
      title: 'Opening mail client…',
      description: `Replying to ${email}`,
    });
  };

  if (messages.length === 0) {
    return <p className="text-muted-foreground text-sm">No messages.</p>;
  }

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-4">
        {messages.map((msg) => (
          <Card key={msg._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" /> {msg.Messges}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                From: {msg.patienName} ({msg.patienEmail}) • {new Date(msg.createdAt).toLocaleDateString()}
              </p>
              <p className="whitespace-pre-line break-words text-sm">{msg.body}</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" onClick={() => handleReply(msg.patienEmail, msg.Messges)}>
                Reply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default Inbox;
