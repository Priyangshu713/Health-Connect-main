
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, Scale, Heart, Droplet } from 'lucide-react';
import { HealthData } from '@/store/healthStore';

interface MetricComparisonProps {
  title: string;
  current: number | null | undefined;
  previous: number | null | undefined;
  icon: React.ReactNode;
  unit?: string;
  higherIsBetter?: boolean;
}

const MetricComparison: React.FC<MetricComparisonProps> = ({ 
  title, current, previous, icon, unit = '', higherIsBetter = true 
}) => {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return null;
  }

  const diff = current - previous;
  const percentChange = previous !== 0 ? (diff / previous) * 100 : 0;
  const isPositive = higherIsBetter ? diff > 0 : diff < 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-full bg-muted">{icon}</div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold">
            {current}
            {unit && <span className="text-sm ml-1 font-normal text-muted-foreground">{unit}</span>}
          </div>
          <div className="text-xs text-muted-foreground">Previous: {previous}{unit}</div>
        </div>
        
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
            isNeutral 
              ? 'bg-gray-100 text-gray-600' 
              : isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
          }`}
        >
          {isNeutral ? (
            <Minus className="h-3 w-3" />
          ) : isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          <span>{Math.abs(Math.round(percentChange))}%</span>
        </div>
      </div>
    </div>
  );
};

interface HistoryComparisonCardProps {
  currentData: HealthData;
  historicalData?: HealthData;
}

const HistoryComparisonCard: React.FC<HistoryComparisonCardProps> = ({ currentData, historicalData }) => {
  if (!historicalData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not enough historical data to compare yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Health Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricComparison
            title="BMI"
            current={currentData.bmi}
            previous={historicalData.bmi}
            icon={<Scale className="h-4 w-4" />}
            higherIsBetter={false}
          />
          
          <MetricComparison
            title="Weight"
            current={currentData.weight}
            previous={historicalData.weight}
            icon={<Scale className="h-4 w-4" />}
            unit="kg"
            higherIsBetter={false}
          />
          
          <MetricComparison
            title="Blood Glucose"
            current={currentData.bloodGlucose}
            previous={historicalData.bloodGlucose}
            icon={<Droplet className="h-4 w-4" />}
            unit="mg/dL"
            higherIsBetter={false}
          />
          
          <MetricComparison
            title="Overall Health Score"
            current={currentData.overallAdvancedScore}
            previous={historicalData.overallAdvancedScore}
            icon={<Activity className="h-4 w-4" />}
            higherIsBetter={true}
          />
          
          {currentData.sleepScore !== undefined && historicalData.sleepScore !== undefined && (
            <MetricComparison
              title="Sleep Score"
              current={currentData.sleepScore}
              previous={historicalData.sleepScore}
              icon={<Heart className="h-4 w-4" />}
              higherIsBetter={true}
            />
          )}
          
          {currentData.exerciseScore !== undefined && historicalData.exerciseScore !== undefined && (
            <MetricComparison
              title="Exercise Score"
              current={currentData.exerciseScore}
              previous={historicalData.exerciseScore}
              icon={<Activity className="h-4 w-4" />}
              higherIsBetter={true}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoryComparisonCard;
