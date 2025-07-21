import React, { useState, useEffect } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link, useParams, useNavigate } from "react-router-dom";
import { validateResetToken, resetPassword } from '@/api/auth';

const formSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const ResetPasswordPage = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (!token) {
            return;
        }

        const checkToken = async () => {
            try {
                const result = await validateResetToken(token);
                setIsValidToken(true);
                setEmail(result.email);
            } catch (error) {
                setIsValidToken(false);
                toast({
                    title: "Invalid reset link",
                    description: "This password reset link is invalid or has expired",
                    variant: "destructive",
                });
            } finally {
                setIsValidating(false);
            }
        };

        checkToken();
    }, [token, toast]);

    const onSubmit = async (data: FormValues) => {
        if (!token) return;

        setIsLoading(true);
        try {
            await resetPassword(token, data.password);

            setIsSuccess(true);
            toast({
                title: "Password reset successful",
                description: "Your password has been updated. You can now log in with your new password.",
            });

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
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
                            {isSuccess
                                ? "Password Reset Successfully"
                                : isValidating
                                    ? "Verifying your link"
                                    : isValidToken
                                        ? "Create New Password"
                                        : "Invalid Link"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isSuccess
                                ? "Your password has been updated successfully"
                                : isValidating
                                    ? "Please wait while we verify your reset link"
                                    : isValidToken
                                        ? `Create a new password for ${email}`
                                        : "This password reset link is invalid or has expired"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {isValidating && (
                            <div className="flex flex-col items-center py-8">
                                <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
                                <p className="text-center text-muted-foreground">
                                    Verifying your reset link...
                                </p>
                            </div>
                        )}

                        {!isValidating && !isValidToken && !isSuccess && (
                            <div className="flex flex-col items-center py-8">
                                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                                <p className="text-center text-muted-foreground">
                                    This password reset link is invalid or has expired. Please request a new one.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/forgot-password')}
                                    className="mt-4"
                                >
                                    Request new link
                                </Button>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="flex flex-col items-center py-8">
                                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                                <p className="text-center text-muted-foreground">
                                    Your password has been reset successfully. You will be redirected to the login page shortly.
                                </p>
                            </div>
                        )}

                        {!isValidating && isValidToken && !isSuccess && (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
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
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm New Password</FormLabel>
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
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-health-lavender hover:opacity-90"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Updating password..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>

                    {isSuccess && (
                        <CardFooter className="flex justify-center">
                            <Link to="/">
                                <Button variant="link">
                                    Go to Login
                                </Button>
                            </Link>
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ResetPasswordPage; 