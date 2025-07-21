
import React from 'react';
import { ExternalLink } from 'lucide-react';

// Extended health info content for the Learn More dialogs
const healthInfoContent = {
  'Stress Management': {
    title: 'Stress Management',
    description: 'Understanding the impact of stress on your health',
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">What is chronic stress?</h3>
        <p className="mb-4">
          Chronic stress is a prolonged and constant feeling of stress that can negatively affect your health. Unlike acute stress, which is short-term and often a normal response to a challenge or threat, chronic stress persists over an extended period and can lead to serious health problems.
        </p>
        
        <h3 className="text-lg font-medium mb-2">Health impacts of chronic stress:</h3>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li>Increased risk of heart disease and high blood pressure</li>
          <li>Weakened immune system</li>
          <li>Anxiety and depression</li>
          <li>Sleep problems</li>
          <li>Weight gain</li>
          <li>Memory and concentration impairment</li>
          <li>Digestive issues</li>
        </ul>
        
        <h3 className="text-lg font-medium mb-2">Effective stress management techniques:</h3>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Mindfulness meditation:</strong> Practice focusing on the present moment without judgment</li>
          <li><strong>Regular physical activity:</strong> Aim for at least 30 minutes of moderate exercise most days</li>
          <li><strong>Adequate sleep:</strong> Maintain a consistent sleep schedule of 7-9 hours</li>
          <li><strong>Time management:</strong> Prioritize tasks, set boundaries, and include relaxation time</li>
          <li><strong>Social connections:</strong> Spend time with supportive friends and family</li>
          <li><strong>Limit caffeine and alcohol:</strong> Both can trigger or worsen stress and anxiety</li>
        </ul>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a 
            href="https://www.nimh.nih.gov/health/publications/stress" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            Visit National Institute of Mental Health for more resources
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </>
    )
  },
  'Poor Nutrition': {
    title: 'Nutrition Fundamentals',
    description: 'Building better eating habits for optimal health',
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">Why nutrition matters</h3>
        <p className="mb-4">
          Proper nutrition provides your body with the necessary nutrients, vitamins, and minerals to function optimally. Poor nutrition can lead to nutritional deficiencies, weakened immunity, and increased risk of chronic diseases.
        </p>
        
        <h3 className="text-lg font-medium mb-2">Common nutritional challenges:</h3>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li>Excessive intake of processed foods high in added sugars and unhealthy fats</li>
          <li>Insufficient consumption of fruits, vegetables, and whole grains</li>
          <li>Inadequate protein intake</li>
          <li>Dehydration and excessive consumption of sugary drinks</li>
          <li>Irregular eating patterns and skipping meals</li>
        </ul>
        
        <h3 className="text-lg font-medium mb-2">Building better nutrition habits:</h3>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Eat a variety of foods:</strong> Include fruits, vegetables, whole grains, lean proteins, and healthy fats</li>
          <li><strong>Control portion sizes:</strong> Be mindful of portion sizes to avoid overeating</li>
          <li><strong>Stay hydrated:</strong> Drink plenty of water throughout the day</li>
          <li><strong>Limit processed foods:</strong> Reduce consumption of foods high in added sugars, sodium, and unhealthy fats</li>
          <li><strong>Plan meals:</strong> Prepare healthy meals in advance to avoid unhealthy choices when busy</li>
          <li><strong>Read nutrition labels:</strong> Understand what you're eating by checking nutrition facts</li>
        </ul>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a 
            href="https://www.myplate.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            Visit MyPlate for more nutrition resources
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </>
    )
  },
  'Sedentary Lifestyle': {
    title: 'Active Living',
    description: 'Incorporating movement into your daily routine',
    content: (
      <>
        <h3 className="text-lg font-medium mb-2">The dangers of sitting too much</h3>
        <p className="mb-4">
          A sedentary lifestyle, characterized by minimal physical activity and prolonged sitting, is associated with numerous health risks including obesity, heart disease, type 2 diabetes, and certain cancers.
        </p>
        
        <h3 className="text-lg font-medium mb-2">Health risks of a sedentary lifestyle:</h3>
        <ul className="list-disc pl-5 mb-4 space-y-1.5">
          <li>Increased risk of cardiovascular disease</li>
          <li>Higher likelihood of developing type 2 diabetes</li>
          <li>Muscle weakness and decreased bone density</li>
          <li>Increased risk of obesity</li>
          <li>Poorer mental health outcomes</li>
          <li>Decreased energy levels and productivity</li>
        </ul>
        
        <h3 className="text-lg font-medium mb-2">Tips to increase physical activity:</h3>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Take regular breaks:</strong> Stand up and move around for 5 minutes every hour</li>
          <li><strong>Walking meetings:</strong> Conduct meetings while walking when possible</li>
          <li><strong>Use stairs instead of elevators:</strong> Take the stairs whenever possible</li>
          <li><strong>Active commuting:</strong> Walk or bike to work if feasible</li>
          <li><strong>Set a timer:</strong> Use reminders to prompt movement throughout the day</li>
          <li><strong>Find enjoyable activities:</strong> Choose physical activities you enjoy to make exercise sustainable</li>
          <li><strong>Start small:</strong> Begin with small amounts of activity and gradually increase</li>
        </ul>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a 
            href="https://www.cdc.gov/physicalactivity/basics/index.htm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors"
          >
            Visit CDC Physical Activity Guidelines for more information
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </>
    )
  }
};

export default healthInfoContent;
