"use client"

import { ArrowRight, Database, Lock, Zap, FileSearch, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm">
            <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Powered by DuckDB WASM</span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight bg-linear-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Privacy-First Analytics
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Query your data locally in the browser. Zero server involvement. Complete privacy. Lightning fast.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="group text-lg px-8 py-6 rounded-xl"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 rounded-xl"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              View on GitHub
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-chart-1" />
              <span>100% Client-Side</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-chart-2" />
              <span>No Data Upload</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-chart-3" />
              <span>Lightning Fast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose Privacy-First Analytics?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the power of SQL analytics without compromising your data privacy
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-chart-1 to-chart-1/50 flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Browser-Based SQL</h3>
              <p className="text-muted-foreground">
                Full-featured DuckDB running entirely in your browser. Execute complex SQL queries on CSV, Parquet, and JSON files.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-chart-2 to-chart-2/50 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Privacy</h3>
              <p className="text-muted-foreground">
                Your data never leaves your device. No uploads, no servers, no tracking. Your analysis stays completely private.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-chart-3 to-chart-3/50 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Performance</h3>
              <p className="text-muted-foreground">
                Powered by WebAssembly for near-native performance. Query millions of rows in milliseconds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-chart-4 to-chart-4/50 flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple File Formats</h3>
              <p className="text-muted-foreground">
                Support for CSV, Parquet, JSON, and more. Seamlessly query across different data formats.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-chart-5 to-chart-5/50 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Built-in data visualization, statistics, quality checks, and query history. Everything you need in one place.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all hover:shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary/50 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Setup Required</h3>
              <p className="text-muted-foreground">
                No installation, no configuration, no backend. Just open and start analyzing your data instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-3xl border border-border bg-linear-to-br from-card to-muted/20">
          <h2 className="text-3xl lg:text-4xl font-bold">Ready to analyze your data?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start querying your data with complete privacy and lightning-fast performance.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="group text-lg px-8 py-6 rounded-xl"
          >
            Launch Analytics Engine
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}

