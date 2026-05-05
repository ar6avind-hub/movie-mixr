import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { friendlyAuthError } from "@/lib/errors";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery hash and emits PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Also check existing session in case event already fired
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Double-check both fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Couldn't update password", description: friendlyAuthError(error.message), variant: "destructive" });
      return;
    }
    toast({ title: "Password updated", description: "You're all set." });
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
              <h1 className="font-display text-4xl tracking-tight sm:text-5xl">New password</h1>
              <p className="text-sm text-muted-foreground">
                {ready ? "Choose something memorable." : "Verifying reset link…"}
              </p>
            </div>

            {ready && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <PasswordInput
                    id="confirm"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Updating…" : "Update password"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
