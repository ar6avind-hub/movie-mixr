import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowRight, Film, ListMusic, Share2 } from "lucide-react";

const FILMS = [
  "Blade Runner 2049", "In the Mood for Love", "Mulholland Drive", "Drive",
  "Lost in Translation", "Paris, Texas", "Stalker", "Her", "Past Lives",
  "Persona", "The Holy Mountain", "Suspiria",
];

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        style={{ background: "var(--gradient-spot)" }}
      />
      <SiteHeader />

      {/* Hero */}
      <section className="container relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border hairline bg-elevated px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            For people who love films
          </div>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-balance sm:text-7xl md:text-8xl animate-fade-up">
            Playlists,<br />
            <span className="italic text-muted-foreground">for cinema.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground sm:text-lg animate-fade-up [animation-delay:120ms]">
            Curate, organize, and revisit the films that move you.
            CINEBLEND turns your watchlist into something worth sharing.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up [animation-delay:240ms]">
            <Button size="lg" asChild className="group min-w-[180px]">
              <Link to="/register">
                Start curating
                <ArrowRight className="ml-1 h-4 w-4 transition-smooth group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/login">I have an account</Link>
            </Button>
          </div>
        </div>

        {/* Film marquee */}
        <div className="relative mt-24 overflow-hidden border-y hairline py-6 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-2xl text-muted-foreground sm:text-3xl">
            {[...FILMS, ...FILMS].map((f, i) => (
              <span key={i} className="flex items-center gap-12">
                {f}
                <span className="text-foreground/20">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-32">
        <div className="grid gap-px overflow-hidden rounded-2xl border hairline bg-hairline sm:grid-cols-3">
          {[
            {
              icon: ListMusic,
              title: "Build playlists",
              body: "Group films by mood, director, decade — whatever moves you.",
            },
            {
              icon: Film,
              title: "One library",
              body: "Every film you've ever wanted to watch, in one quiet place.",
            },
            {
              icon: Share2,
              title: "Made to share",
              body: "Trade collections with friends. Discover through people, not algorithms.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-background p-8 transition-smooth hover:bg-elevated">
              <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <h3 className="mt-6 font-display text-2xl tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="container pb-32 text-center">
        <h2 className="font-display text-4xl tracking-tight sm:text-6xl text-balance">
          Your taste,<br />
          <span className="italic text-muted-foreground">organized.</span>
        </h2>
        <Button size="lg" asChild className="mt-10">
          <Link to="/register">Create your first playlist</Link>
        </Button>
      </section>

      <footer className="border-t hairline">
        <div className="container flex h-16 items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
          <span>© CINEBLEND</span>
          <span>Est. 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
