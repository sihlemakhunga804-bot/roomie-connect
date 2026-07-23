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
import { Phone, Lock, ArrowRight, CheckCircle, ArrowLeft } from "lucide-react";
import {
  sendRecoveryCode,
  verifyRecoveryCode,
  resetPassword,
} from "@/lib/auth";

type Step = "phone" | "verification" | "reset" | "complete";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Enter a valid phone number" })
    .max(20)
    .regex(/^[0-9+()\-\s]+$/, { message: "Digits, spaces, +, -, () only" }),
});

const verificationSchema = z.object({
  code: z
    .string()
    .length(4, { message: "Code must be 4 digits" })
    .regex(/^\d+$/, { message: "Code must contain only digits" }),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PhoneInput = z.infer<typeof phoneSchema>;
type VerificationInput = z.infer<typeof verificationSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    if (currentStep === "verification") {
      setCurrentStep("phone");
    } else if (currentStep === "reset") {
      setCurrentStep("verification");
    } else if (currentStep === "phone") {
      navigate({ to: "/login" });
    }
  };

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
        {currentStep === "phone" && (
          <PhoneStep
            onNext={(p) => {
              setPhone(p);
              setCurrentStep("verification");
            }}
            onBack={handleBack}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        {currentStep === "verification" && (
          <VerificationStep
            phone={phone}
            onNext={() => setCurrentStep("reset")}
            onBack={handleBack}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        {currentStep === "reset" && (
          <ResetPasswordStep
            phone={phone}
            onComplete={() => setCurrentStep("complete")}
            onBack={handleBack}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        {currentStep === "complete" && (
          <CompleteScreen navigate={navigate} />
        )}
      </main>
    </div>
  );
}

function PhoneStep({
  onNext,
  onBack,
  isLoading,
  setIsLoading,
}: {
  onNext: (phone: string) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const form = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = (data: PhoneInput) => {
    setIsLoading(true);
    setTimeout(() => {
      const success = sendRecoveryCode(data.phone);
      setIsLoading(false);

      if (!success) {
        toast.error("No account found with this phone number");
        return;
      }

      toast.success(`Recovery code sent to ${data.phone}`);
      onNext(data.phone);
    }, 600);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="size-4" /> Back to login
        </button>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Forgot your password?
        </h1>
        <p className="text-muted-foreground">
          Enter your phone number and we'll send you a recovery code.
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
  );
}

function VerificationStep({
  phone,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
}: {
  phone: string;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const form = useForm<VerificationInput>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = (data: VerificationInput) => {
    if (!verifyRecoveryCode(data.code)) {
      toast.error("Invalid recovery code");
      return;
    }

    toast.success("Code verified!");
    onNext();
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Verify your code
        </h1>
        <p className="text-muted-foreground">
          We've sent a recovery code to {phone}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="code">Enter 4-digit code</FormLabel>
                  <FormControl>
                    <Input
                      id="code"
                      placeholder="0000"
                      maxLength={4}
                      className="text-center text-2xl tracking-widest"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full group py-6 text-lg">
              Verify code
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Check your browser console for the recovery code.
        </p>
      </div>
    </div>
  );
}

function ResetPasswordStep({
  phone,
  onComplete,
  onBack,
  isLoading,
  setIsLoading,
}: {
  phone: string;
  onComplete: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    setIsLoading(true);
    setTimeout(() => {
      const success = resetPassword(phone, data.password);
      setIsLoading(false);

      if (!success) {
        toast.error("Failed to reset password. Please try again.");
        return;
      }

      toast.success("Password reset successfully!");
      onComplete();
    }, 600);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Create new password
        </h1>
        <p className="text-muted-foreground">
          Enter a strong password to secure your account.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        autoComplete="new-password"
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
                  <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        autoComplete="new-password"
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
              {isLoading ? "Resetting..." : "Reset password"}
              {!isLoading && (
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

function CompleteScreen({ navigate }: { navigate: any }) {
  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="size-8 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Password reset!
        </h1>
        <p className="text-muted-foreground">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
      </div>

      <Button
        onClick={() => navigate({ to: "/login" })}
        className="w-full py-6 text-lg"
      >
        Back to Login
      </Button>
    </div>
  );
}
