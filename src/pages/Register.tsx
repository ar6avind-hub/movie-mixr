import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { friendlyAuthError } from "@/lib/errors";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      toast({ title: "Add your name", description: "We'll use it to greet you.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(trimmedEmail, password, trimmedName);
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't create account", description: friendlyAuthError(error), variant: "destructive" });
      return;
    }
    toast({ title: "Welcome to CINEBLEND", description: "Your library is ready." });
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[400px]"
        style={{ background: "var(--gradient-spot)" }}
      />
      <div className="container flex min-h-screen flex-col">
        <div className="py-6 sm:py-8">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-center pb-16 sm:pb-20">
          <div className="w-full max-w-sm space-y-8 animate-fade-up sm:space-y-10">
            <div className="space-y-3 text-center">
              <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Begin a library</h1>
              <p className="text-sm text-muted-foreground">
                A few seconds. Then you're curating.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoComplete="name"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
