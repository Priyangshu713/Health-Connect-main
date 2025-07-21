import React, { useState } from 'react';
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
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { dispatchAuthEvent } from '@/App';
import { loginUser } from '@/api/auth';
import { useHealthStore } from '@/store/healthStore';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm = ({ onLoginSuccess }: LoginFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setGeminiTier } = useHealthStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const result = await loginUser({
        email: data.email,
        password: data.password,
      });

      // Store auth info in local storage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', result.name);
      localStorage.setItem('token', result.token);

      // Store tier information if available
      if (result.tier) {
        localStorage.setItem('geminiTier', result.tier);
        setGeminiTier(result.tier);
      }

      // Dispatch auth event for real-time UI updates
      dispatchAuthEvent(true, data.email);

      // Show success toast
      toast({
        title: "Login successful",
        description: "Welcome back to HealthConnect!",
      });

      // Call the onLoginSuccess callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Redirect to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
          transition={{ delay: 0.2 }}
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
                      className="pl-10 pr-10"
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <div className="text-sm text-right">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-2"
        >
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-health-lavender hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-center text-muted-foreground mt-4"
        >
          By signing in, you agree to our <Link to="/terms-privacy" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/terms-privacy?tab=privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </motion.p>
      </form>
    </Form>
  );
};

export default LoginForm;
