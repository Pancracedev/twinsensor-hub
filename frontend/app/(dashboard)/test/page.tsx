'use client';

import { IntegrationTest } from '../../components';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Integration Test</h1>
          <p className="text-gray-600">
            Verify that the frontend and backend are properly connected
          </p>
        </div>

        <div className="space-y-6">
          <IntegrationTest />

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Frontend</p>
                <p className="text-2xl font-bold text-blue-900">✓</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Backend</p>
                <p className="text-2xl font-bold text-green-900">✓</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Environment</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><strong>API URL:</strong> http://localhost:3001</li>
                <li><strong>Socket.io URL:</strong> http://localhost:3001</li>
                <li><strong>Frontend URL:</strong> http://localhost:3000</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
