import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lock, Mail, User, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { dispatchAuthEvent } from '@/App';
import { registerUser } from '@/api/auth';
import { useHealthStore } from '@/store/healthStore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setGeminiTier } = useHealthStore();
  const [accountDeleted, setAccountDeleted] = useState(false);
  const [emailToRecover, setEmailToRecover] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Function to remove email from deleted accounts list
  const removeFromDeletedAccounts = (email: string) => {
    try {
      const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
      const updatedAccounts = deletedAccounts.filter((account: string) => account !== email);
      localStorage.setItem('healthconnect_deleted_accounts', JSON.stringify(updatedAccounts));
      console.log(`Removed account ${email} from deleted accounts list`);
      return true;
    } catch (error) {
      console.error('Error removing from deleted accounts:', error);
      return false;
    }
  };

  // Check for deleted status when email changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email' && value.email) {
        try {
          const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
          if (deletedAccounts.includes(value.email)) {
            setAccountDeleted(true);
            setEmailToRecover(value.email);
          } else {
            setAccountDeleted(false);
            setEmailToRecover('');
          }
        } catch (e) {
          console.error('Error checking deleted accounts:', e);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle account recovery
  const handleRecoverAccount = () => {
    setIsRecovering(true);

    try {
      if (removeFromDeletedAccounts(emailToRecover)) {
        setAccountDeleted(false);
        toast({
          title: "Account recovered",
          description: "Your account has been recovered. You can now register with this email.",
        });
      } else {
        toast({
          title: "Recovery failed",
          description: "Unable to recover your account. Please try again or use a different email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Recovery error:', error);
      toast({
        title: "Recovery failed",
        description: "An unexpected error occurred during recovery.",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      // Check if this account was previously marked as deleted
      const wasDeleted = (() => {
        try {
          const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
          return deletedAccounts.includes(data.email);
        } catch (e) {
          return false;
        }
      })();

      // Submit only name, email, and password to the API
      const { name, email, password } = data;
      const registerData = { name, email, password };

      const result = await registerUser(registerData);

      // Store auth info in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('token', result.token);

      // Store tier information (defaults to 'free' for new users)
      if (result.tier) {
        localStorage.setItem('geminiTier', result.tier);
        setGeminiTier(result.tier);
      } else {
        localStorage.setItem('geminiTier', 'free');
        setGeminiTier('free');
      }

      // Dispatch auth event to update global state
      dispatchAuthEvent(true, email);

      // Show success toast - special message if account was previously deleted
      toast({
        title: wasDeleted ? "Account reactivated" : "Account created successfully",
        description: wasDeleted
          ? "Your previously deleted account has been reactivated."
          : "Welcome to HealthConnect!",
      });

      // Navigate to profile page
      navigate('/profile', { state: { justLoggedIn: true } });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {accountDeleted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Previously Deleted Account</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">This email address was previously used with an account that was deleted.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 bg-destructive/10 border-destructive/20"
                  onClick={handleRecoverAccount}
                  disabled={isRecovering}
                >
                  {isRecovering ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Recovering...
                    </>
                  ) : (
                    "Recover Account"
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Your name"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="you@example.com"
                      className="pl-10"
                      type="email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="••••••••"
                      className="pl-10"
                      type="password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="••••••••"
                      className="pl-10"
                      type="password"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-2"
        >
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-health-mint to-primary hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-center text-muted-foreground mt-2"
        >
          By signing up, you agree to our <Link to="/terms-privacy" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/terms-privacy?tab=privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </motion.p>
      </form>
    </Form>
  );
};

export default SignupForm;
