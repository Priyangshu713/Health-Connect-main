
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from 'lucide-react';

interface DoctorReviewsProps {
  doctorId: string;
}

export const DoctorReviews: React.FC<DoctorReviewsProps> = ({ doctorId }) => {
  // This would normally fetch reviews from an API
  const reviews = [
    {
      id: '1',
      patientName: 'John D.',
      date: '2023-05-15',
      rating: 5,
      comment: 'Dr. Miller is extremely knowledgeable and took the time to explain everything thoroughly. Would highly recommend!'
    },
    {
      id: '2',
      patientName: 'Sarah L.',
      date: '2023-04-22',
      rating: 4,
      comment: 'Very professional and caring. The wait time was a bit long but the care I received was worth it.'
    },
    {
      id: '3',
      patientName: 'Michael T.',
      date: '2023-03-10',
      rating: 5,
      comment: 'Extremely satisfied with my visit. Dr. Miller addressed all my concerns and the treatment plan has been working great.'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {review.patientName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-medium">{review.patientName}</h4>
                  <time className="text-sm text-muted-foreground">
                    {new Date(review.date).toLocaleDateString()}
                  </time>
                </div>
                
                <div className="flex mt-1 mb-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
                
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
