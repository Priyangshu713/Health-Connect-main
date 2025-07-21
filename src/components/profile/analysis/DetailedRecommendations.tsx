
import React from 'react';
import { motion } from 'framer-motion';

interface DetailedRecommendationsProps {
  category: string;
}

interface RecommendationItem {
  emoji: string;
  text: string;
  subItems?: string[];
}

const DetailedRecommendations: React.FC<DetailedRecommendationsProps> = ({ category }) => {
  // Determine recommendations based on category
  const getRecommendations = (): RecommendationItem[] => {
    switch (category) {
      case 'sleep':
        return [
          {
            emoji: '🌙',
            text: 'Maintain a consistent sleep schedule',
            subItems: [
              'Go to bed and wake up at the same time each day',
              'Aim for 7-9 hours of sleep nightly',
              'Create a bedtime routine to signal your body it\'s time to sleep'
            ]
          },
          {
            emoji: '📱',
            text: 'Limit screen time before bed',
            subItems: [
              'Avoid screens 1 hour before bedtime',
              'Use night mode on devices if necessary',
              'Replace screen time with reading or gentle stretching'
            ]
          },
          {
            emoji: '🛏️',
            text: 'Create an optimal sleep environment',
            subItems: [
              'Keep your bedroom cool (65-68°F/18-20°C)',
              'Ensure your room is dark and quiet',
              'Consider using white noise or a fan if needed'
            ]
          },
          {
            emoji: '☕',
            text: 'Watch your consumption habits',
            subItems: [
              'Avoid caffeine at least 6 hours before bedtime',
              'Limit alcohol, which disrupts sleep quality',
              'Avoid large meals close to bedtime'
            ]
          }
        ];
      case 'exercise':
        return [
          {
            emoji: '🚶',
            text: 'Start with walking daily',
            subItems: [
              'Aim for 30 minutes of walking most days',
              'Break it up into 10-minute segments if needed',
              'Gradually increase your pace and distance'
            ]
          },
          {
            emoji: '💪',
            text: 'Add strength training',
            subItems: [
              'Incorporate 2-3 days of strength exercises weekly',
              'Start with bodyweight exercises (squats, push-ups)',
              'Gradually add resistance bands or weights'
            ]
          },
          {
            emoji: '🧘',
            text: 'Include flexibility and balance',
            subItems: [
              'Try gentle yoga or stretching routines',
              'Hold stretches for 15-30 seconds',
              'Practice balance exercises like standing on one foot'
            ]
          },
          {
            emoji: '📱',
            text: 'Track your progress',
            subItems: [
              'Use a fitness app to log activities',
              'Set small, achievable goals',
              'Celebrate your improvements, no matter how small'
            ]
          }
        ];
      case 'nutrition':
        return [
          {
            emoji: '🍎',
            text: 'Focus on whole foods',
            subItems: [
              'Fill half your plate with vegetables and fruits',
              'Choose whole grains over refined options',
              'Minimize processed foods and added sugars'
            ]
          },
          {
            emoji: '⏰',
            text: 'Establish regular meal patterns',
            subItems: [
              'Eat at consistent times each day',
              'Don\'t skip meals, especially breakfast',
              'Consider smaller, more frequent meals if it helps control hunger'
            ]
          },
          {
            emoji: '💧',
            text: 'Stay hydrated',
            subItems: [
              'Drink water before, during, and between meals',
              'Replace sugary beverages with water or herbal tea',
              'Check your urine color – pale yellow indicates good hydration'
            ]
          },
          {
            emoji: '🥦',
            text: 'Increase fiber intake',
            subItems: [
              'Add vegetables to every meal',
              'Choose fruits with edible skins and seeds',
              'Include beans and legumes regularly'
            ]
          }
        ];
      case 'hydration':
        return [
          {
            emoji: '⏰',
            text: 'Create a hydration schedule',
            subItems: [
              'Drink a glass of water when you wake up',
              'Set reminders to drink every 1-2 hours',
              'Have water before, during, and after exercise'
            ]
          },
          {
            emoji: '🍋',
            text: 'Make water more appealing',
            subItems: [
              'Add fruits, vegetables, or herbs for natural flavor',
              'Try cucumber, lemon, berries, or mint',
              'Consider sparkling water as an occasional alternative'
            ]
          },
          {
            emoji: '🍵',
            text: 'Explore hydrating alternatives',
            subItems: [
              'Herbal teas count toward fluid intake',
              'Consume hydrating foods like watermelon and cucumber',
              'Use broth-based soups as another hydration source'
            ]
          },
          {
            emoji: '📱',
            text: 'Track your intake',
            subItems: [
              'Use a water tracking app or journal',
              'Get a marked water bottle showing intake goals',
              'Aim for urine that\'s pale yellow or clear'
            ]
          }
        ];
      case 'stress':
        return [
          {
            emoji: '🧘',
            text: 'Practice daily mindfulness',
            subItems: [
              'Start with just 5 minutes of meditation daily',
              'Try deep breathing exercises when feeling stressed',
              'Use guided meditation apps for structure'
            ]
          },
          {
            emoji: '🚶',
            text: 'Move your body regularly',
            subItems: [
              'Physical activity reduces stress hormones',
              'Even short walks can provide mental clarity',
              'Consider yoga, which combines movement and mindfulness'
            ]
          },
          {
            emoji: '📱',
            text: 'Set digital boundaries',
            subItems: [
              'Take regular breaks from screens',
              'Avoid checking work emails during off hours',
              'Create tech-free zones or times in your home'
            ]
          },
          {
            emoji: '❤️',
            text: 'Connect with others',
            subItems: [
              'Nurture supportive relationships',
              'Share your feelings with trusted friends or family',
              'Consider joining groups with similar interests'
            ]
          }
        ];
      case 'lifestyle':
        return [
          {
            emoji: '⏰',
            text: 'Establish consistent routines',
            subItems: [
              'Wake up and go to bed at similar times daily',
              'Plan regular meals and exercise',
              'Include quiet time for relaxation and reflection'
            ]
          },
          {
            emoji: '🌿',
            text: 'Spend time in nature',
            subItems: [
              'Aim for at least 20 minutes outdoors daily',
              'Try "forest bathing" - mindful time among trees',
              'Grow plants indoors if outdoor access is limited'
            ]
          },
          {
            emoji: '📚',
            text: 'Engage in continuous learning',
            subItems: [
              'Read books that inspire and inform you',
              'Take courses in areas that interest you',
              'Learn new skills that challenge your mind'
            ]
          },
          {
            emoji: '🛋️',
            text: 'Create a healthy home environment',
            subItems: [
              'Declutter regularly to reduce stress',
              'Ensure good ventilation and air quality',
              'Design spaces that support your wellness goals'
            ]
          }
        ];
      case 'overall':
      default:
        return [
          {
            emoji: '🗓️',
            text: 'Schedule regular health check-ups',
            subItems: [
              'Annual physical examination',
              'Regular blood work and screenings as recommended',
              'Dental check-ups every 6 months'
            ]
          },
          {
            emoji: '📝',
            text: 'Keep a health journal',
            subItems: [
              'Track symptoms, medications, and health changes',
              'Note patterns in energy, mood, and sleep',
              'Share relevant information with healthcare providers'
            ]
          },
          {
            emoji: '🧠',
            text: 'Adopt a holistic approach',
            subItems: [
              'Balance physical, mental, and social well-being',
              'Practice stress management daily',
              'Make time for activities that bring you joy'
            ]
          },
          {
            emoji: '🥄',
            text: 'Practice moderation',
            subItems: [
              'Allow occasional treats without guilt',
              'Focus on progress rather than perfection',
              'Make sustainable changes rather than drastic ones'
            ]
          }
        ];
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="space-y-4">
      <h5 className="text-sm font-medium text-primary">Detailed Actions You Can Take</h5>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium">
              <span className="mr-2 text-base">{rec.emoji}</span> 
              {rec.text}
            </p>
            
            {rec.subItems && (
              <ul className="ml-7 space-y-1">
                {rec.subItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground list-disc">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>
      
      <p className="text-xs mt-4 pt-2 border-t border-border/30 text-muted-foreground">
        These recommendations are general guidelines. Always consult with healthcare professionals before making significant changes to your health routine.
      </p>
    </div>
  );
};

export default DetailedRecommendations;
