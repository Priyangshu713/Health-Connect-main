
export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  subspecialties?: string[];
  hospital: string;
  location: string;
  experience: number;
  rating: number;
  reviewCount: number;
  patients: number;
  bio: string;
  education?: string[];
  certifications?: string[];
  specializations?: string[];
  availability?: {
    days: string[];
    hours: string;
  };
  contactInfo?: {
    email: string;
    phone: string;
  };
  imageUrl?: string;
  isDoctor?: boolean; // Flag to identify doctor accounts
  password?: string; // Only used during authentication, not stored in client-side data
}
