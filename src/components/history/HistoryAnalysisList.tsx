
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HistoryEntry } from '@/store/historyStore';
import { AnalysisSection } from '@/store/healthStore';
import { Calendar, Heart, Brain, Dumbbell, BedIcon, CupSoda, Utensils, Activity } from 'lucide-react';

interface HistoryAnalysisListProps {
  historyEntries: HistoryEntry[];
}

const HistoryAnalysisList: React.FC<HistoryAnalysisListProps> = ({ historyEntries }) => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  
  // Helper function to get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <BedIcon className="h-5 w-5 text-health-lavender" />;
      case 'exercise':
        return <Dumbbell className="h-5 w-5 text-health-mint" />;
      case 'stress':
        return <Brain className="h-5 w-5 text-health-pink" />;
      case 'nutrition':
        return <Utensils className="h-5 w-5 text-health-amber" />;
      case 'hydration':
        return <CupSoda className="h-5 w-5 text-health-sky" />;
      case 'lifestyle':
        return <Activity className="h-5 w-5 text-health-teal" />;
      case 'overall':
      default:
        return <Heart className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {historyEntries.map((entry) => (
        <Card key={entry.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis from {format(new Date(entry.date), 'MMMM d, yyyy')}</CardTitle>
                <CardDescription>{format(new Date(entry.date), 'h:mm a')}</CardDescription>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {format(new Date(entry.date), 'EEEE')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {entry.analysis && entry.analysis.length > 0 ? (
              <Accordion
                type="single" 
                collapsible
                value={expandedEntry === entry.id ? 'analysis' : undefined}
                onValueChange={(value) => setExpandedEntry(value === 'analysis' ? entry.id : null)}
              >
                <AccordionItem value="analysis" className="border-none">
                  <AccordionTrigger className="py-2">
                    <span className="text-sm font-medium">View Analysis Details</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Tabs defaultValue="overall">
                      <TabsList className="mb-4 flex flex-wrap">
                        {entry.analysis.map((section) => (
                          <TabsTrigger key={section.category} value={section.category} className="flex items-center gap-1.5">
                            {getCategoryIcon(section.category)}
                            <span className="hidden sm:inline">{section.title.split(' ')[0]}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {entry.analysis.map((section) => (
                        <TabsContent key={section.category} value={section.category} className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">{section.title}</h3>
                            <div className="flex items-center mt-2">
                              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full" 
                                  style={{ width: `${section.score}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm font-medium">{section.score}/100</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Analysis</h4>
                            <p className="text-sm text-muted-foreground">{section.analysis}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Recommendation</h4>
                            <p className="text-sm text-muted-foreground">{section.recommendation}</p>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="py-2 text-sm text-muted-foreground">
                Basic health metrics only - no detailed analysis available for this entry
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">BMI</div>
                <div className="text-lg font-semibold mt-1">
                  {entry.healthData.bmi || 'N/A'}
                  {entry.healthData.bmiCategory && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      ({entry.healthData.bmiCategory})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="text-xs text-muted-foreground">Overall Health</div>
                <div className="text-lg font-semibold mt-1">
                  {entry.healthData.overallAdvancedScore ? `${entry.healthData.overallAdvancedScore}/100` : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HistoryAnalysisList;
