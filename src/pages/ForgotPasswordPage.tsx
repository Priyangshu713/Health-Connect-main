import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { requestPasswordReset } from '@/api/auth';

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" })
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPasswordPage = () => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            await requestPasswordReset(data.email);

            setIsSubmitted(true);
            toast({
                title: "Reset email sent",
                description: "If an account with that email exists, a password reset link has been sent",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div
                className="w-full max-w-md"
                variants={itemVariants}
            >
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </div>

                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">
                            {isSubmitted ? "Check your email" : "Reset your password"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isSubmitted
                                ? "We've sent you a link to reset your password"
                                : "Enter your email address and we'll send you a link to reset your password"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center py-8"
                            >
                                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                                <p className="text-center text-muted-foreground">
                                    Please check your email for a link to reset your password.
                                    If you don't see it, check your spam folder.
                                </p>
                                <Button
                                    variant="link"
                                    onClick={() => setIsSubmitted(false)}
                                    className="mt-4"
                                >
                                    Try another email
                                </Button>
                            </motion.div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-health-lavender hover:opacity-90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Sending..." : "Send reset link"}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ForgotPasswordPage; 