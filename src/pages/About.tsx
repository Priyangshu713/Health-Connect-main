import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Globe,
  Lightbulb,
  MessageSquare,
  Github,
  Linkedin
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Priyangshu Dutta",
      role: "UI/UX Designer, Front-end Developer, AI Model Developer",
      description: "Leads the user interface design, front-end development, and AI model integration for Health Connect.",
      image: "https://avatars.githubusercontent.com/u/134028923?v=4",
      github: "https://github.com/Priyangshu713",
      linkedin: "https://www.linkedin.com/in/priyangshu-dutta-/"
    },
        {
      name: "Tarak Nath Jana",
      role: "Backend, Data Collection, API calling",
      description: "Responsible to implementing the 'ScanBar' feature to the website. Responsible for building backend infrastructure with API callings.",
      image: "https://avatars.githubusercontent.com/u/140452004?v=4",
      github: "https://github.com/tarakNathJ/",
      linkedin: "https://www.linkedin.com/in/tarak-nath-jana-7411a0301/" 
    },
    {
      name: "Abhilash Bhunia",
      role: "AI Model Developer, Data Analysis",
      description: "Develops advanced AI models and performs health data analysis to power Health Connect's recommendations.",
      image: "https://avatars.githubusercontent.com/u/96327051?v=4",
      github: "https://github.com/Abhilash-Bh",
      linkedin: "https://www.linkedin.com/in/abhilash-bhunia-2807261a3/"
    },
    {
      name: "Swapnil Pramanik",
      role: "Front-end Developer, Backend Developer",
      description: "Creates responsive user interfaces and builds the backend infrastructure for Health Connect.",
      image: "https://avatars.githubusercontent.com/u/147524160?v=4",
      github: "https://github.com/Swapnil8918980827",
      linkedin: "https://www.linkedin.com/in/swapnil-pramanik-774860354/"
    },
    {
      name: "Adnan Alam",
      role: "Backend Developer, API Connection",
      description: "Develops backend services and integrates external health APIs to enhance the platform's capabilities.",
      image: "https://avatars.githubusercontent.com/u/204746565?v=4",
      github: "https://github.com/adnan786397",
      //linkedin: "https://linkedin.com/in/adnanalam"
    },
    {
      name: "Anirban Maity",
      role: "Security analyst & PenTester",
      description: "Ensures Health Connect's security through data authentication and penetration testing methodologies.",
      image: "https://avatars.githubusercontent.com/u/174888109?v=4",
      github: "https://github.com/cobraa9",
      // linkedin: "https://linkedin.com/in/anirbanmaity"
    },
  ];

  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          className="space-y-16 max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-gradient">Health<span className="font-extralight">Connect</span></span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering individuals to take control of their health through personalized insights,
              nutrition guidance, and AI-powered recommendations.
            </p>
          </motion.section>

          {/* Why Health Connect is Important */}
          <motion.section variants={itemVariants} className="mb-20">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/3 flex justify-center">
                <div className="bg-primary/5 p-8 rounded-full transition-all duration-300 hover:bg-primary/10">
                  <Heart className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-semibold mb-6">Why Health Connect Matters</h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  In today's fast-paced world, managing personal health has become increasingly complex. With overwhelming
                  information available online, people struggle to find reliable, personalized guidance tailored to their unique needs.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Health Connect bridges this gap by providing evidence-based health tracking, personalized recommendations,
                  and an intuitive platform that makes health management accessible to everyone, regardless of their health literacy level.
                </p>
              </div>
            </div>
          </motion.section>

          <Separator className="bg-primary/10" />

          {/* Functionality */}
          <motion.section variants={itemVariants} className="my-20">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/3 flex justify-center order-1 md:order-2">
                <div className="bg-primary/5 p-8 rounded-full transition-all duration-300 hover:bg-primary/10">
                  <Lightbulb className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="md:w-2/3 order-2 md:order-1">
                <h2 className="text-3xl font-semibold mb-6">Our Functionality</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Comprehensive Health Tracking</h3>
                      <p className="text-muted-foreground">Track vital health metrics including BMI, activity levels, nutrition, and more in one centralized dashboard.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Personalized Recommendations</h3>
                      <p className="text-muted-foreground">Receive tailored health advice based on your unique profile, goals, and medical history.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">AI-Powered Insights</h3>
                      <p className="text-muted-foreground">Advanced AI analyzes your health data to identify patterns and provide actionable insights.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full min-w-12 h-12 flex items-center justify-center mt-1">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Nutrition Guidance</h3>
                      <p className="text-muted-foreground">Expert nutritional recommendations tailored to your dietary preferences and health needs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <Separator className="bg-primary/10" />

          {/* Impact on Society and Health */}
          <motion.section variants={itemVariants} className="my-20">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/3 flex justify-center">
                <div className="bg-primary/5 p-8 rounded-full transition-all duration-300 hover:bg-primary/10">
                  <Globe className="h-16 w-16 text-primary" />
                </div>
              </div>
              <div className="md:w-2/3">
                <h2 className="text-3xl font-semibold mb-6">Our Impact</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Health Connect is revolutionizing how individuals approach their health, leading to measurable improvements in wellness outcomes and healthcare efficiency.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3">Individual Health</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Users report significant improvements in health metrics, better adherence to health recommendations, and increased confidence in managing their wellness journey.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-3">Healthcare System</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        By promoting preventive care and early intervention, Health Connect helps reduce healthcare costs and alleviates pressure on overburdened healthcare systems.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </motion.section>

          <Separator className="bg-primary/10" />

          {/* Team Section - Redesigned for sophistication */}
          <motion.section variants={itemVariants} className="mt-20">
            <h2 className="text-3xl font-semibold mb-6 text-center">Our Team</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Health Connect was developed by a multidisciplinary team of specialists passionate about improving global health outcomes through technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar className="w-28 h-28 mb-6 border-4 border-primary/10">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm text-center mb-4 max-w-xs">{member.description}</p>

                  <div className="flex space-x-3">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors p-2 bg-primary/5 rounded-full hover:bg-primary/10"
                      aria-label={`${member.name}'s GitHub`}
                    >
                      <Github size={18} />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors p-2 bg-primary/5 rounded-full hover:bg-primary/10"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <Linkedin size={18} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact Section */}
          <motion.section
            variants={itemVariants}
            className="mt-24 bg-gradient-to-r from-primary/5 to-primary/10 p-10 rounded-2xl"
          >
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-6 opacity-80" />
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
                Have questions about Health Connect? Want to learn more about how we can help you on your health journey?
              </p>
              <Button
                variant="default"
                className="px-8 py-6 h-auto rounded-full text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default AboutPage;
