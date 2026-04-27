import { Link, useNavigate } from "react-router-dom";
import { Compass, Heart, Library, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

/**
 * Sticky top navigation. On small screens we collapse the labelled
 * destinations into icon-only buttons so the header never overflows.
 */
export const SiteHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b hairline bg-background/70 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between gap-3 sm:h-16">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              {/* Icon-only on mobile, label + icon on >=sm */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-10 w-10 px-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <Link to="/discover" aria-label="Discover">
                  <Compass className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Discover</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-10 w-10 px-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <Link to="/favorites" aria-label="Favorites">
                  <Heart className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Favorites</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-10 w-10 px-0 sm:h-9 sm:w-auto sm:px-3"
              >
                <Link to="/dashboard" aria-label="Library">
                  <Library className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Library</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
                className="h-10 w-10 px-0 sm:h-9 sm:w-auto sm:px-3"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="h-10 sm:h-9">
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="h-10 sm:h-9">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
