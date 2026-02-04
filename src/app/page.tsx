import { Button } from "@esmate/shadcn/components/ui/button";
import { Badge } from "@esmate/shadcn/components/ui/badge";
import { Card } from "@esmate/shadcn/components/ui/card";
import { ExternalLink, Github, ShoppingCart } from "@esmate/shadcn/pkgs/lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-5 sm:py-10 lg:py-16">
      <div className="flex flex-col items-center space-y-8">
        {/* Hire Me Button */}
        <div>
          <Button asChild size="lg" className="w-full gap-2 bg-orange-600 font-bold sm:w-auto">
            <a href="https://viendinh.vercel.app/" target="_blank" rel="noopener noreferrer">
              Hire Me as Your Full-Stack Developer
            </a>
          </Button>
        </div>

        {/* Hero Content */}
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
              Next Shopify Storefront
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              A modern{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/next-shopify-storefront" target="__blank">
                  Shopping Cart
                </a>
              </Badge>{" "}
              built with{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/esmate" target="__blank">
                  ESMate
                </a>
              </Badge>
              ,{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/esmate/tree/main/packages/shadcn" target="__blank">
                  ShadCN
                </a>
              </Badge>
              ,{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/esmate/tree/main/templates/react-next" target="__blank">
                  Next.js
                </a>
              </Badge>
              ,{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/esmate/tree/main/packages/react" target="__blank">
                  React.js
                </a>
              </Badge>
              ,{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/esmate/tree/main/packages/eslint" target="__blank">
                  ESLint
                </a>
              </Badge>
              ,{" "}
              <Badge variant="outline" className="mx-1">
                <a href="https://github.com/VienDinhCom/esmate/tree/main/packages/prettier" target="__blank">
                  Prettier
                </a>
              </Badge>
              ,{" "}
              <Badge variant="outline" className="mx-1">
                GraphQL
              </Badge>
              , and{" "}
              <Badge variant="outline" className="mx-1">
                Shopify Hydrogen
              </Badge>
              .
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/products">
                <ShoppingCart className="h-4 w-4" />
                Browse Products
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
              <a href="https://github.com/maxvien/next-shopify-storefront" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                View on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-3">
          <Card className="space-y-2 p-6 text-center transition-shadow hover:shadow-lg">
            <div className="text-3xl font-bold text-primary">⚡</div>
            <h3 className="font-semibold">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Built with Next.js for optimal performance</p>
          </Card>
          <Card className="space-y-2 p-6 text-center transition-shadow hover:shadow-lg">
            <div className="text-3xl font-bold text-primary">🎨</div>
            <h3 className="font-semibold">Modern Design</h3>
            <p className="text-sm text-muted-foreground">Styled with Tailwind CSS and ShadCN UI</p>
          </Card>
          <Card className="space-y-2 p-6 text-center transition-shadow hover:shadow-lg">
            <div className="text-3xl font-bold text-primary">🛍️</div>
            <h3 className="font-semibold">Shopify Powered</h3>
            <p className="text-sm text-muted-foreground">Integrated with Shopify Storefront API</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
