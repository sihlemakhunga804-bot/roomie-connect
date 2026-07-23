import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  SignupRole,
  SignupStep,
  basicInfoSchema,
  verificationSchema,
  profileSetupSchema,
  getSignupSession,
  setSignupSession,
  clearSignupSession,
  sendVerificationCode,
  verifyCode,
  completeSignup,
  phoneExists,
  type BasicInfoInput,
  type VerificationInput,
  type ProfileSetupInput,
  type SignupData,
} from "@/lib/signup";
import { Home, User as UserIcon, Phone, Lock, ArrowRight, CheckCircle, ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupFlow,
});

function SignupFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SignupStep>("welcome");
  const [role, setRole] = useState<SignupRole | null>(null);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const session = getSignupSession();
    if (session?.role) {
      setRole(session.role as SignupRole);
      if (session.phone) {
        setCurrentStep("verification");
      } else {
        setCurrentStep("basic-info");
      }
    }
  }, []);

  const handleRoleSelect = (selectedRole: SignupRole) => {
    setRole(selectedRole);
    setSignupSession({ role: selectedRole });
    setCurrentStep("basic-info");
  };

  const handleBack = () => {
    if (currentStep === "basic-info") {
      setCurrentStep("welcome");
      setRole(null);
      clearSignupSession();
    } else if (currentStep === "verification") {
      setCurrentStep("basic-info");
      setVerificationCodeSent(false);
    } else if (currentStep === "profile-setup") {
      setCurrentStep("verification");
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
        {currentStep === "welcome" && (
          <WelcomeScreen onSelectRole={handleRoleSelect} />
        )}
        {currentStep === "basic-info" && role && (
          <BasicInfoStep role={role} onNext={() => setCurrentStep("verification")} onBack={handleBack} />
        )}
        {currentStep === "verification" && role && (
          <VerificationStep
            role={role}
            onVerified={() => setCurrentStep("profile-setup")}
            onBack={handleBack}
            verificationCodeSent={verificationCodeSent}
            setVerificationCodeSent={setVerificationCodeSent}
          />
        )}
        {currentStep === "profile-setup" && role && (
          <ProfileSetupStep role={role} onComplete={() => setCurrentStep("complete")} onBack={handleBack} />
        )}
        {currentStep === "complete" && role && (
          <CompleteScreen role={role} navigate={navigate} />
        )}
      </main>
    </div>
  );
}

function WelcomeScreen({ onSelectRole }: { onSelectRole: (role: SignupRole) => void }) {
  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Join ROOMIE
        </h1>
        <p className="text-muted-foreground">
          Join to start renting or listing homes.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onSelectRole("tenant")}
          className="w-full group border-2 border-border rounded-2xl p-6 text-left transition-all hover:border-primary hover:bg-card/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold mb-1">I'm looking for a room</h3>
              <p className="text-sm text-muted-foreground">
                Browse homes and find your perfect match.
              </p>
            </div>
            <UserIcon className="size-6 text-primary flex-shrink-0 mt-1" />
          </div>
        </button>

        <button
          onClick={() => onSelectRole("landlord")}
          className="w-full group border-2 border-border rounded-2xl p-6 text-left transition-all hover:border-primary hover:bg-card/50"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold mb-1">I'm a landlord</h3>
              <p className="text-sm text-muted-foreground">
                List your properties and find great tenants.
              </p>
            </div>
            <Home className="size-6 text-primary flex-shrink-0 mt-1" />
          </div>
        </button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

function BasicInfoStep({
  role,
  onNext,
  onBack,
}: {
  role: SignupRole;
  onNext: () => void;
  onBack: () => void;
}) {
  const form = useForm<BasicInfoInput>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = (data: BasicInfoInput) => {
    if (phoneExists(data.phone)) {
      form.setError("phone", {
        type: "manual",
        message: "An account with this phone already exists. Try signing in instead.",
      });
      return;
    }
    setSignupSession({
      name: data.name,
      phone: data.phone,
      password: data.password,
    });
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
          Create your account
        </h1>
        <p className="text-muted-foreground">
          Tell us a bit about yourself.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name or Nickname</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="e.g. Sarah or Sunrise Properties"
                        className="pl-10"
                        autoComplete="name"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">Contact Number</FormLabel>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        autoComplete="current-password"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full group py-6 text-lg">
              Continue
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

function VerificationStep({
  role,
  onVerified,
  onBack,
  verificationCodeSent,
  setVerificationCodeSent,
}: {
  role: SignupRole;
  onVerified: () => void;
  onBack: () => void;
  verificationCodeSent: boolean;
  setVerificationCodeSent: (sent: boolean) => void;
}) {
  const form = useForm<VerificationInput>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const session = getSignupSession();
  const [isLoading, setIsLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  const handleSendCode = () => {
    const phone = session?.phone;
    if (!phone) {
      setSendError("We couldn't find your phone number. Please go back and re-enter it.");
      return;
    }
    setSendError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        sendVerificationCode(phone);
        setVerificationCodeSent(true);
        toast.success(`Verification code sent to ${phone}`);
      } catch {
        setSendError("Something went wrong sending the code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 600);
  };


  const onSubmit = (data: VerificationInput) => {
    const result = verifyCode(data.code);
    if (result.ok) {
      setSignupSession({ verificationCode: data.code });
      setVerified(true);
      toast.success("Phone verified!");
      setTimeout(() => {
        onVerified();
      }, 1200);
      return;
    }
    const message =
      result.reason === "no-code"
        ? "Your code has expired. Tap Resend to get a new one."
        : result.reason === "mismatch"
          ? "That code doesn't match. Double-check the SMS and try again."
          : "We couldn't verify the code right now. Please try again.";
    form.setError("code", { type: "manual", message });
  };

  if (verified) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="size-8 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Number verified
          </h1>
          <p className="text-muted-foreground">
            Great — {session?.phone} is confirmed.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Taking you to the next step…
        </div>
      </div>
    );
  }

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
          Verify your number
        </h1>
        <p className="text-muted-foreground">
          We've sent a code to {session?.phone}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        {!verificationCodeSent ? (
          <div className="space-y-3">
            <Button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full group py-6 text-lg"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Button>
            {sendError && (
              <p role="alert" className="text-sm text-destructive text-center">
                {sendError}
              </p>
            )}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter 4-digit code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0000"
                        maxLength={4}
                        inputMode="numeric"
                        className="text-center text-2xl tracking-widest"
                        {...field}
                        onChange={(e) => {
                          form.clearErrors("code");
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full group py-6 text-lg">
                Verify
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isLoading ? "Resending..." : "Resend code"}
              </button>
              {sendError && (
                <p role="alert" className="text-sm text-destructive text-center">
                  {sendError}
                </p>
              )}
            </form>
          </Form>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          Demo code: Check your browser console for the verification code.
        </p>
      </div>
    </div>
  );
}

function ProfileSetupStep({
  role,
  onComplete,
  onBack,
}: {
  role: SignupRole;
  onComplete: () => void;
  onBack: () => void;
}) {
  const form = useForm<ProfileSetupInput>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      propertyName: "",
      preferredLocation: "",
      budget: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const finalize = (profileData?: SignupData["profileData"]) => {
    setSubmitError(null);
    setIsLoading(true);
    setTimeout(() => {
      const session = getSignupSession();
      if (!session || !session.role || !session.name || !session.phone || !session.password) {
        setIsLoading(false);
        setSubmitError(
          "Some of your details are missing. Please go back and complete the earlier steps."
        );
        return;
      }

      try {
        const success = completeSignup({
          role: session.role as SignupRole,
          name: session.name,
          phone: session.phone,
          password: session.password,
          profileData,
        });

        setIsLoading(false);
        if (success) {
          onComplete();
        } else {
          setSubmitError(
            "We couldn't create your account. An account with this phone may already exist — try signing in instead."
          );
        }
      } catch {
        setIsLoading(false);
        setSubmitError("Something went wrong finishing signup. Please try again.");
      }
    }, 600);
  };

  const onSubmit = (data: ProfileSetupInput) => {
    finalize({
      landlord: { propertyName: data.propertyName },
      tenant: { preferredLocation: data.preferredLocation, budget: data.budget },
    });
  };

  const handleSkip = () => finalize();

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
          {role === "landlord" ? "Add your property" : "Set your preferences"}
        </h1>
        <p className="text-muted-foreground">
          Optional — you can skip and do this later.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {role === "landlord" ? (
              <FormField
                control={form.control}
                name="propertyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sunset Apartments, Garden Villa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="preferredLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Location (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Cape Town, Johannesburg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. R3000 - R5000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" disabled={isLoading} className="w-full group py-6 text-lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <button
          onClick={handleSkip}
          disabled={isLoading}
          className="w-full mt-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {isLoading ? "Setting up..." : "Skip for now"}
        </button>

        {submitError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p>{submitError}</p>
              <p className="text-xs text-destructive/80">
                Already have an account?{" "}
                <Link to="/login" className="underline font-medium">
                  Sign in instead
                </Link>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompleteScreen({ role, navigate }: { role: SignupRole; navigate: any }) {
  useEffect(() => {
    setTimeout(() => {
      if (role === "landlord") {
        navigate({ to: "/landlord" });
      } else {
        navigate({ to: "/browse" });
      }
    }, 2000);
  }, [role, navigate]);

  return (
    <div className="w-full max-w-md space-y-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="size-8 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Welcome to ROOMIE!
        </h1>
        <p className="text-muted-foreground">
          {role === "landlord"
            ? "Your account is ready. Let's list your first property."
            : "Your account is ready. Let's find your next home."}
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        Redirecting you to your {role === "landlord" ? "landlord" : "tenant"} dashboard...
      </div>
    </div>
  );
}
