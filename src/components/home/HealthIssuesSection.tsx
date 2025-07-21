import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HealthIssuesSectionProps {
  openDialog: (dialogKey: string) => void;
}

const HealthIssuesSection: React.FC<HealthIssuesSectionProps> = ({ openDialog }) => {
  // Reference for concerns section
  const concernsRef = useRef(null);
  const concernsInView = useInView(concernsRef, { once: true, amount: 0.2 });

  const healthIssues = [
    {
      title: 'Stress Management',
      description: 'Chronic stress can lead to various health problems, including heart disease, high blood pressure, and mental health disorders.',
      solution: 'Regular mindfulness practices, adequate sleep, and time management can help reduce stress levels.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
    },
    {
      title: 'Poor Nutrition',
      description: 'Inadequate nutrition is linked to weakened immunity, decreased energy, and increased risk of chronic diseases.',
      solution: 'Focus on a balanced diet rich in fruits, vegetables, lean proteins, and whole grains.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    },
    {
      title: 'Sedentary Lifestyle',
      description: 'Lack of physical activity contributes to obesity, heart disease, and decreased mental well-being.',
      solution: 'Aim for at least 150 minutes of moderate exercise weekly and reduce sitting time throughout the day.',
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop',
    },
  ];

  return (
    <section ref={concernsRef} className="py-20 px-4 bg-gradient-to-b from-background to-secondary/20">
      <motion.div
        className="container mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={concernsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient text-center">Common Health Concerns</h2>
        <p className="text-lg text-foreground max-w-xl mx-auto text-center">
          Understanding these common health challenges and their solutions can help improve your quality of life.
        </p>
      </motion.div>

      <div className="container mx-auto space-y-20">
        {healthIssues.map((issue, index) => (
          <motion.div
            key={index}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-lg aspect-video group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <motion.div
                className="absolute bottom-0 left-0 w-full p-4 text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-xl font-bold">{issue.title}</h3>
              </motion.div>
            </motion.div>

            <div className="w-full lg:w-1/2 space-y-4">
              <motion.h3
                className="text-2xl md:text-3xl font-bold"
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {issue.title}
              </motion.h3>
              <motion.p
                className="text-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {issue.description}
              </motion.p>
              <motion.div
                className="p-4 bg-primary/10 border border-primary/20 rounded-lg shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              >
                <h4 className="font-medium mb-2">Solution:</h4>
                <p className="text-foreground">{issue.solution}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  variant="link"
                  className="flex items-center p-0 gap-1 hover:gap-2 transition-all duration-300 text-primary font-medium group"
                  onClick={() => openDialog(issue.title)}
                >
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HealthIssuesSection;
