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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Home, User as UserIcon } from "lucide-react";
import { login, loginSchema, type UserRole } from "@/lib/auth";

type LoginValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(data: LoginValues) {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const user = login(data.email, data.password, data.rememberMe);
      setIsLoading(false);

      if (!user) {
        toast.error("Invalid email or password");
        return;
      }

      if (user.role !== role) {
        toast.error(`This account is registered as a ${user.role}, not a ${role}`);
        return;
      }

      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on role
      if (user.role === "landlord") {
        navigate({ to: "/landlord" });
      } else {
        navigate({ to: "/applications" });
      }
    }, 600);
  }

  if (!role) {
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
              <h1 className="font-display text-4xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Choose your account type to continue.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setRole("tenant")}
                className="w-full group border-2 border-border rounded-2xl p-6 text-left transition-all hover:border-primary hover:bg-card/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-1">I'm looking for a room</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in to find your next home and track applications.
                    </p>
                  </div>
                  <UserIcon className="size-6 text-primary flex-shrink-0 mt-1" />
                </div>
              </button>

              <button
                onClick={() => setRole("landlord")}
                className="w-full group border-2 border-border rounded-2xl p-6 text-left transition-all hover:border-primary hover:bg-card/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-1">I'm a landlord</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in to manage your properties and tenant applications.
                    </p>
                  </div>
                  <Home className="size-6 text-primary flex-shrink-0 mt-1" />
                </div>
              </button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Sign up here
              </Link>
            </div>
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
            <button
              onClick={() => setRole(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              ← Back
            </button>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              {role === "landlord" ? "Landlord Login" : "Tenant Login"}
            </h1>
            <p className="text-muted-foreground">
              {role === "landlord"
                ? "Sign in to manage your rentals and find the perfect tenants."
                : "Sign in to find your next home and track your applications."}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
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

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
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
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group py-6 text-lg"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                  {!isLoading && (
                    <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                  )}
                </Button>
              </form>
            </Form>
          </div>

          <div className="space-y-3 text-center text-sm text-muted-foreground">
            <p>
              {role === "landlord"
                ? "Don't have a landlord account? "
                : "Don't have an account? "}
              <Link
                to={role === "landlord" ? "/landlord/signup" : "/"}
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
            <div className="flex items-center gap-2 justify-center text-xs">
              <span>Demo credentials:</span>
              <code className="bg-muted px-2 py-1 rounded font-mono text-xs">
                {role === "landlord"
                  ? "landlord@example.com"
                  : "tenant@example.com"}
              </code>
            </div>
            <p className="text-xs">Password: password123</p>
          </div>
        </div>
      </main>
    </div>
  );
}
