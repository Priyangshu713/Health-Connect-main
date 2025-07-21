
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import AnalysisCard from './AnalysisCard';
import { AnalysisSection } from '@/store/healthStore';

interface AnalysisContentProps {
  analysis: AnalysisSection[];
  loading: boolean;
  error: string | null;
}

const AnalysisContent: React.FC<AnalysisContentProps> = ({ analysis, loading, error }) => {
  return (
    <>
      {analysis.map((section, index) => (
        <TabsContent key={index} value={section.category} className="mt-0">
          <AnalysisCard section={section} loading={loading} error={error} />
        </TabsContent>
      ))}
    </>
  );
};

export default AnalysisContent;
