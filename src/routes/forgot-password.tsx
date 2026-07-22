import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Phone, ArrowRight, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Enter a valid phone number" })
    .max(20)
    .regex(/^[0-9+()−\s]+$/, { message: "Digits, spaces, +, -, () only" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: "",
    },
  });

  function onSubmit(data: ForgotPasswordValues) {
    setIsLoading(true);
    // Simulate sending recovery email
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success("Recovery email sent! Check your inbox.");
    }, 800);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="size-7 rounded-full bg-primary" />
              <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
            </Link>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle className="size-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-4xl font-bold tracking-tight">
                Check your SMS
              </h1>
              <p className="text-muted-foreground">
                We've sent a password recovery code to <strong>{form.getValues("phone")}</strong>
              </p>
            </div>

            <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Check your SMS inbox if you don't see it</p>
              <p>• The code expires in 24 hours</p>
              <p>• Use the code to reset your password</p>
            </div>
            </div>

            <Button
              onClick={() => navigate({ to: "/login" })}
              className="w-full py-6 text-lg"
            >
              Back to Login
            </Button>

            <p className="text-sm text-muted-foreground">
              Didn't receive the SMS?{" "}
              <button
                onClick={() => {
                  setSubmitted(false);
                  form.reset();
                }}
                className="text-primary font-medium hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-7 rounded-full bg-primary" />
            <span className="font-display text-2xl font-bold tracking-tight">roomie</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-4">
              ← Back to login
            </Link>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Forgot your password?
            </h1>
            <p className="text-muted-foreground">
              Enter your phone number and we'll send you a code to reset your password.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="phone">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="+27 82 000 0000"
                            className="pl-10"
                            type="tel"
                            autoComplete="tel"
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
                  disabled={isLoading}
                  className="w-full group py-6 text-lg"
                >
                  {isLoading ? "Sending..." : "Send recovery code"}
                  {!isLoading && (
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
