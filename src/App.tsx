import { DNSChecker } from './features/dns/components/DNSChecker';
import { WhoisChecker } from './features/whois/components/WhoisChecker';
import { SSLChecker } from './features/ssl/components/SSLChecker';
import { SecurityScanner } from './features/security/components/SecurityScanner';
import { PerformanceChecker } from './features/performance/components/PerformanceChecker';
import { HeadersAnalyzer } from './features/headers/components/HeadersAnalyzer';
import { APP_NAME, APP_VERSION } from './shared/constants/config';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {APP_NAME}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive website analysis and security tool
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-500">v{APP_VERSION}</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Analysis Tools
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Analyze websites with our comprehensive suite of tools. Check DNS records,
            WHOIS information, SSL certificates, security headers, performance metrics, and more.
          </p>
        </div>

        <div className="space-y-6">
          <DNSChecker />
          <WhoisChecker />
          <SSLChecker />
          <SecurityScanner />
          <PerformanceChecker />
          <HeadersAnalyzer />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              &copy; 2024 {APP_NAME}. Built with Vite, React, TypeScript, and Cloudflare Pages.
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              Powered by Cloudflare's global network for fast, secure analysis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
