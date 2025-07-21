
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSearch, ArrowRight } from 'lucide-react';

const EmptyHistoryState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full py-8 flex flex-col items-center justify-center bg-gradient-to-b from-muted/50 to-muted/30 border-dashed animate-fade-in">
      <CardContent className="flex flex-col items-center text-center pt-6">
        <div className="p-4 rounded-full bg-muted mb-4">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No History Found</h3>
        <p className="text-muted-foreground max-w-md">
          You haven't made any health analyses yet. Complete your profile and run an analysis to start tracking your health progress.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => navigate('/profile')}
          className="gap-2"
        >
          Go to Profile
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmptyHistoryState;
