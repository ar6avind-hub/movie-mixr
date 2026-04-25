import { Link } from "react-router-dom";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
    <span className="relative flex h-7 w-7 items-center justify-center rounded-md border hairline bg-elevated">
      <span className="block h-2 w-2 rounded-full bg-foreground transition-smooth group-hover:scale-125" />
    </span>
    <span className="font-display text-xl tracking-tight">CINEBLEND</span>
  </Link>
);
