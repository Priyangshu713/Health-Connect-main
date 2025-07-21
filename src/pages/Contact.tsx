import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Phone, MapPin, Send, Loader2, Clock, Check, ChevronDown, ChevronUp, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// Replace with your actual EmailJS service IDs
const SERVICE_ID = 'service_3y2vg5n';
const TEMPLATE_ID = 'template_bih3xv9';
const PUBLIC_KEY = 'up916aLQKcVp5vB6S';

// This constant will be the fixed recipient email
const ADMIN_EMAIL = 'priyangshu713@gmail.com';

const ContactPage = () => {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        to_email: ADMIN_EMAIL,
        subject: '',
        message: ''
    });
    const [activeTab, setActiveTab] = useState('message');
    const [messageSent, setMessageSent] = useState(false);
    const navigate = useNavigate();

    // Initialize EmailJS when component mounts
    useEffect(() => {
        emailjs.init(PUBLIC_KEY);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const floatingAnimation = {
        y: [0, -10, 0],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    };

    const pulseAnimation = {
        scale: [1, 1.05, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formRef.current) return;

        try {
            setIsSubmitting(true);

            // EmailJS template parameters - matching template variables exactly
            const templateParams = {
                name: formData.name,
                email: formData.email,
                title: formData.subject,  // If your template uses "title" instead of "subject"
                message: formData.message,
                reply_to: formData.email
            };

            console.log("Sending with template params:", templateParams);

            const result = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );

            console.log('Email successfully sent!', result.text);

            toast({
                title: "Message sent successfully!",
                description: "We'll get back to you as soon as possible.",
                variant: "default",
            });

            // Show success animation
            setMessageSent(true);

            // Reset form
            setFormData({
                name: '',
                email: '',
                to_email: ADMIN_EMAIL,
                subject: '',
                message: ''
            });

            // Reset success state after 3 seconds
            setTimeout(() => {
                setMessageSent(false);
            }, 3000);

        } catch (error: any) {
            console.error('Failed to send email:', error);

            // More detailed error message
            let errorMessage = "Please try again later or contact us directly via email.";
            if (error.text) {
                errorMessage = `Error: ${error.text}`;
            }

            toast({
                title: "Message failed to send",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const faqItems = [
        {
            question: "How secure is my health data?",
            answer: "Your health data is encrypted and stored securely. We follow industry best practices for data protection and comply with all relevant privacy regulations. All connections are secured with SSL and we regularly audit our security measures."
        },
        {
            question: "Can I integrate with my wearable devices?",
            answer: "Yes, Health Connect supports integration with popular wearable devices and health apps to provide a comprehensive view of your health. We currently support Apple Health, Google Fit, Fitbit, Garmin, Oura Ring, and Whoop, with more integrations coming soon."
        },
        {
            question: "How accurate are the AI recommendations?",
            answer: "Our AI recommendations are based on established health guidelines and your personal data. They're designed to be helpful guides, not medical diagnoses. We continuously improve our algorithms based on the latest medical research and feedback from healthcare professionals."
        },
        {
            question: "Is there a mobile app available?",
            answer: "Currently, Health Connect is optimized for web browsers on both desktop and mobile devices. A dedicated mobile app for iOS and Android is in final stages of development and will be released in the next few months. Sign up for our newsletter to be notified when it launches."
        },
        {
            question: "Do you offer personalized health coaching?",
            answer: "Yes, our Pro tier includes access to certified health coaches who can provide personalized guidance based on your health data. You can schedule video consultations or chat with coaches directly through the platform."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
                    animate={pulseAnimation}
                />
                <motion.div
                    className="absolute top-1/3 -left-20 w-72 h-72 bg-health-mint/10 rounded-full blur-3xl"
                    animate={pulseAnimation}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-health-pink/5 rounded-full blur-3xl"
                    animate={pulseAnimation}
                />
            </div>

            <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
                <motion.div
                    className="space-y-16 max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Hero Section */}
                    <motion.section variants={itemVariants} className="text-center mb-16">
                        <motion.div
                            className="inline-block mb-6"
                            animate={floatingAnimation}
                        >
                            <div className="bg-primary/10 p-4 rounded-full">
                                <MessageSquare className="h-10 w-10 text-primary" />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Get in <span className="text-gradient">Touch</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We're here to help you on your health journey. Reach out to our team with any questions or feedback.
                        </p>
                    </motion.section>

                    <motion.section variants={itemVariants} className="relative">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                                <TabsTrigger value="message" className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="hidden sm:inline">Message</span>
                                </TabsTrigger>
                                <TabsTrigger value="info" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span className="hidden sm:inline">Contact Info</span>
                                </TabsTrigger>
                                <TabsTrigger value="faq" className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="hidden sm:inline">FAQs</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="message" className="mt-4">
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 gap-10"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Contact Information */}
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-semibold">Our Team is Ready</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Whether you have questions about our platform, need technical support, or want to provide feedback, our team is here to assist.
                                        </p>

                                        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none overflow-hidden">
                                            <CardContent className="p-6 relative">
                                                <motion.div
                                                    className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"
                                                    animate={pulseAnimation}
                                                />
                                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                                    <Clock className="h-5 w-5 text-primary" /> Response Times
                                                </h3>
                                                <div className="space-y-2 text-muted-foreground relative z-10">
                                                    <div className="flex justify-between items-center">
                                                        <p>General Inquiries</p>
                                                        <p className="font-medium text-primary">24 hours</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p>Technical Support</p>
                                                        <p className="font-medium text-primary">12 hours</p>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p>Urgent Issues</p>
                                                        <p className="font-medium text-primary">4 hours</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-4 mt-8">
                                            <h3 className="font-semibold text-lg">Connect With Us</h3>
                                            <div className="flex gap-4">
                                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                                                    <Twitter className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                                                    <Linkedin className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                                                    <Facebook className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                                                    <Instagram className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Form */}
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-semibold">Send a Message</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Fill out the form below and we'll get back to you as soon as possible.
                                        </p>

                                        <AnimatePresence>
                                            {messageSent ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                                    >
                                                        <Check className="h-8 w-8 text-green-600" />
                                                    </motion.div>
                                                    <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                                                    <p className="text-green-700">
                                                        Thank you for reaching out. We'll respond to your inquiry shortly.
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <motion.form
                                                    ref={formRef}
                                                    onSubmit={handleSubmit}
                                                    className="space-y-6 mt-8"
                                                    initial={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                                                Name
                                                            </label>
                                                            <Input
                                                                id="name"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleChange}
                                                                placeholder="Your name"
                                                                className="w-full"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                                                Email
                                                            </label>
                                                            <Input
                                                                id="email"
                                                                name="email"
                                                                type="email"
                                                                value={formData.email}
                                                                onChange={handleChange}
                                                                placeholder="Your email address"
                                                                className="w-full"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                                                Subject
                                                            </label>
                                                            <Input
                                                                id="subject"
                                                                name="subject"
                                                                value={formData.subject}
                                                                onChange={handleChange}
                                                                placeholder="What is this regarding?"
                                                                className="w-full"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label htmlFor="message" className="block text-sm font-medium mb-2">
                                                                Message
                                                            </label>
                                                            <Textarea
                                                                id="message"
                                                                name="message"
                                                                value={formData.message}
                                                                onChange={handleChange}
                                                                placeholder="Your message"
                                                                className="w-full min-h-[150px]"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <Button
                                                        type="submit"
                                                        className="w-full py-6 h-auto rounded-md text-base font-medium shadow-md hover:shadow-lg transition-all duration-300"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Sending...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Send className="h-4 w-4 mr-2" />
                                                                Send Message
                                                            </>
                                                        )}
                                                    </Button>
                                                </motion.form>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="info" className="mt-4">
                                <motion.div
                                    className="max-w-3xl mx-auto space-y-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                                            <motion.div
                                                className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-70"
                                                animate={pulseAnimation}
                                            />
                                            <CardContent className="p-6 text-center">
                                                <motion.div
                                                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <Mail className="h-5 w-5 text-primary" />
                                                </motion.div>
                                                <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                                                <p className="text-muted-foreground break-words">support@healthconnect.com</p>
                                                <p className="text-muted-foreground break-words">info@healthconnect.com</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                                            <motion.div
                                                className="absolute -top-10 -right-10 w-32 h-32 bg-health-mint/10 rounded-full blur-xl opacity-70"
                                                animate={pulseAnimation}
                                            />
                                            <CardContent className="p-6 text-center">
                                                <motion.div
                                                    className="w-12 h-12 rounded-full bg-health-mint/20 flex items-center justify-center mx-auto mb-4"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <Phone className="h-5 w-5 text-health-mint" />
                                                </motion.div>
                                                <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                                                <p className="text-muted-foreground">+1 (800) 123-4567</p>
                                                <p className="text-muted-foreground">Mon-Fri, 9am-6pm EST</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-card/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 overflow-hidden">
                                            <motion.div
                                                className="absolute -top-10 -right-10 w-32 h-32 bg-health-pink/10 rounded-full blur-xl opacity-70"
                                                animate={pulseAnimation}
                                            />
                                            <CardContent className="p-6 text-center">
                                                <motion.div
                                                    className="w-12 h-12 rounded-full bg-health-pink/20 flex items-center justify-center mx-auto mb-4"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    <MapPin className="h-5 w-5 text-health-pink" />
                                                </motion.div>
                                                <h3 className="font-semibold text-lg mb-1">Visit Us</h3>
                                                <p className="text-muted-foreground">Global Institute of Science & Technology</p>
                                                <p className="text-muted-foreground">ICARE Complex, Hatiberia, Purba Medinipur, Haldia, West Bengal 721657, India</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none mt-8">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4 mb-6">
                                                <Clock className="h-5 w-5 text-primary" />
                                                <h3 className="font-semibold text-lg">Office Hours</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2 text-muted-foreground">
                                                    <div className="flex justify-between">
                                                        <span>Monday - Friday:</span>
                                                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Saturday:</span>
                                                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Sunday:</span>
                                                        <span className="font-medium">Closed</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-4">
                                                    <h4 className="font-medium mb-2">Holiday Hours</h4>
                                                    <p className="text-sm text-muted-foreground">We have special hours during major holidays. Please check our social media channels for updates.</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Map placeholder - in a real app, you'd integrate Google Maps or similar */}
                                    <div className="relative h-64 rounded-lg overflow-hidden border border-muted mt-8">
                                        <iframe
                                            title="Global Institute of Science & Technology Map"
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.234393137469!2d88.0716585!3d22.0525575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a02f0bc41d7ef07%3A0xf2ec43b8223e132!2sGlobal%20Institute%20of%20Science%20%26%20Technology!5e0!3m2!1sen!2sin!4v1718030000000!5m2!1sen!2sin"
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen={true}
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="absolute inset-0 w-full h-full"
                                        ></iframe>
                                    </div>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="faq" className="mt-4">
                                <motion.div
                                    className="max-w-3xl mx-auto"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>

                                    <Accordion type="single" collapsible className="w-full">
                                        {faqItems.map((item, index) => (
                                            <AccordionItem key={index} value={`item-${index}`} className="border border-primary/10 rounded-lg mb-4 overflow-hidden">
                                                <AccordionTrigger className="px-6 py-4 hover:bg-primary/5 transition-all data-[state=open]:bg-primary/5">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="px-6 py-4 text-muted-foreground">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>

                                    <div className="bg-primary/5 rounded-lg p-6 mt-8 text-center">
                                        <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
                                        <p className="text-muted-foreground mb-4">Our team is just a message away. We'd be happy to help!</p>
                                        <Button
                                            onClick={() => setActiveTab('message')}
                                            className="gap-2"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Contact Us Now
                                        </Button>
                                    </div>
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </motion.section>

                    <Separator className="bg-primary/10 my-16" />

                    {/* Legal Links Section */}
                    <motion.section variants={itemVariants} className="mt-16 text-center">
                        <h2 className="text-xl font-semibold mb-4">Legal Information</h2>
                        <p className="text-muted-foreground mb-6">
                            For detailed information about how we use your data and our service terms, please review our legal documents.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                variant="outline"
                                className="border-primary/20 hover:border-primary transition-all duration-300"
                                onClick={() => navigate('/terms-privacy?tab=terms')}
                            >
                                Terms of Service
                            </Button>
                            <Button
                                variant="outline"
                                className="border-primary/20 hover:border-primary transition-all duration-300"
                                onClick={() => navigate('/terms-privacy?tab=privacy')}
                            >
                                Privacy Policy
                            </Button>
                            <Button
                                variant="outline"
                                className="border-primary/20 hover:border-primary transition-all duration-300"
                                onClick={() => navigate('/terms-privacy?tab=data')}
                            >
                                Data Processing
                            </Button>
                        </div>
                    </motion.section>
                </motion.div>
            </main>
        </div>
    );
};

export default ContactPage; 
