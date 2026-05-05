import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { friendlyAuthError } from "@/lib/errors";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast({ title: "Email required", description: "Enter the email for your account.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't send email", description: friendlyAuthError(error.message), variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: "Check your inbox", description: "We sent you a reset link." });
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
              <h1 className="font-display text-4xl tracking-tight sm:text-5xl">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                {sent
                  ? "If an account exists, a reset link is on its way."
                  : "Enter your email and we'll send a reset link."}
              </p>
            </div>

            {!sent && (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
