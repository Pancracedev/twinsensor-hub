'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDeviceStore } from '@/app/stores/deviceStore';

interface FeatureProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-lg transition-shadow">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity dark:from-cyan-950/20" />
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const isConnected = useDeviceStore((state) => state.isConnected);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur dark:border-zinc-800/50 dark:bg-black/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ⚡
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Twin Sensor Hub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/monitoring"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Monitoring
              </Link>
              <div
                className={`h-3 w-3 rounded-full transition-colors ${
                  isConnected
                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-zinc-400 dark:bg-zinc-600'
                }`}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8 inline-block">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100/50 px-4 py-2 text-sm font-medium text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
              🚀 Real-time Motion Analysis Platform
            </span>
          </div>

          <h2 className="mb-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            Analyze Device Motion
            <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              with Precision
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Twin Sensor Hub provides real-time motion analysis, AI-powered anomaly detection, and comprehensive device performance monitoring. Understand your device's physical behavior like never before.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row justify-center mb-12">
            <Link
              href="/pairing"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-3 font-medium text-white hover:shadow-lg hover:shadow-cyan-600/50 transition-all"
            >
              {isConnected ? '📱 Monitoring' : '🔗 Pair Device'}
            </Link>
            <Link
              href="/monitoring"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-8 py-3 font-medium text-zinc-900 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              View Dashboard →
            </Link>
          </div>

          {/* Status Badge */}
          {isConnected && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-950/30 dark:text-green-300">
              ✓ Device Connected and Ready
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Powerful Features
            </h3>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Everything you need to understand device motion and performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="📡"
              title="Real-time Streaming"
              description="60Hz sensor data streaming with accelerometer, gyroscope, and magnetometer readings for precise motion capture."
            />

            <FeatureCard
              icon="🤖"
              title="AI Anomaly Detection"
              description="Machine learning algorithms detect unusual motion patterns and predict performance issues before they occur."
            />

            <FeatureCard
              icon="📊"
              title="Performance Metrics"
              description="Monitor CPU, memory, and temperature in real-time with comprehensive trend analysis and alerts."
            />

            <FeatureCard
              icon="🎯"
              title="Device Orientation"
              description="Precise 3D orientation tracking using quaternions and Euler angles for complete spatial awareness."
            />

            <FeatureCard
              icon="📈"
              title="Historical Analysis"
              description="Analyze sensor data over time with exportable CSV files and temporal data visualization."
            />

            <FeatureCard
              icon="🔄"
              title="Playback & Replay"
              description="Replay historical motion data with timeline scrubber control for detailed event investigation."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-3xl font-bold text-cyan-600">60Hz</div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sampling Rate
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-3xl font-bold text-blue-600">9+</div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sensor Types
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-3xl font-bold text-violet-600">&lt;50ms</div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Latency
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-zinc-200 bg-gradient-to-r from-cyan-50 to-blue-50 dark:border-zinc-800 dark:from-cyan-950/20 dark:to-blue-950/20">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h3 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Ready to analyze your device?
          </h3>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Start by pairing your device and exploring real-time sensor data
          </p>
          <Link
            href="/pairing"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-3 font-medium text-white hover:shadow-lg hover:shadow-cyan-600/50 transition-all"
          >
            🔗 Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ⚡
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Twin Sensor Hub &copy; 2024
              </p>
            </div>
            <div className="flex gap-6">
              <Link
                href="/monitoring"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Monitoring
              </Link>
              <Link
                href="/pairing"
                className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Pairing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
