"use client"

import React, { useState } from 'react';
import attendanceService from '@/services/attendanceService';

export default function TestAttendancePage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults(prev => [...prev, { 
        name: testName, 
        success: true, 
        result,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setResults(prev => [...prev, { 
        name: testName, 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const testGetAttendanceRecords = async () => {
    return await attendanceService.getAttendanceRecords();
  };

  const testGetAttendanceRecordsWithoutDates = async () => {
    return await attendanceService.getAttendanceRecords();
  };

  const testGetAttendanceHeatmap = async () => {
    return await attendanceService.getAttendanceHeatmap();
  };



  const testDirectBackendCall = async () => {
    // Test direct call to backend to see if the endpoint exists
    const response = await fetch('/api/attendance/summary?date_from=2024-01-01&date_to=2024-12-31', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return {
      status: response.status,
      statusText: response.statusText,
      data: data
    };
  };

  const testBasicAttendanceCall = async () => {
    // Test basic attendance endpoint without user_id
    const response = await fetch('/api/attendance?date_from=2024-01-01&date_to=2024-12-31', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return {
      status: response.status,
      statusText: response.statusText,
      data: data
    };
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Attendance API Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => runTest('Get Attendance Records', testGetAttendanceRecords)}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Get Records
        </button>

        <button
          onClick={() => runTest('Get Attendance Heatmap', testGetAttendanceHeatmap)}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Get Heatmap
        </button>

        <button
          onClick={() => runTest('Direct Backend Call', testDirectBackendCall)}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Direct Call
        </button>

        <button
          onClick={() => runTest('Basic Attendance', testBasicAttendanceCall)}
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Basic Attendance
        </button>

        <button
          onClick={() => runTest('Records No Dates', testGetAttendanceRecordsWithoutDates)}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test No Dates
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Running test...</p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{result.name}</h3>
              <span className={`px-2 py-1 text-xs rounded ${
                result.success 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{result.timestamp}</p>
            
            {result.success ? (
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            ) : (
              <div className="text-red-600 text-sm">
                Error: {result.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No test results yet. Click a test button to start.
        </div>
      )}
    </div>
  );
}
