'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type ReportData = {
  operationStatus: Array<{ Status: string; Count: number }>;
  recentOperations: Array<{
    OperationID: number;
    StorekeeperEmail: string;
    OperationType: string;
    EntityType: string;
    DataFormat: string;
    Status: string;
    SourceFilename: string | null;
    RequestedAt: string;
  }>;
  recentInventoryUpdates: Array<{
    StorekeeperEmail: string;
    ItemID: number;
    ItemName: string | null;
    Action: string;
    Timestamp: string;
  }>;
  transactionSummary: {
    OrdersCount: number;
    EstimatedRevenue: string | number;
  };
};

function StorekeeperReportsInner() {
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get('name') || 'Storekeeper';
  const storekeeperEmail = params.get('email') || '';

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  async function getReportData() {
    try {
      setLoading(true);
      setErrorMsg('');
      const emailQuery = storekeeperEmail
        ? `?storekeeperEmail=${encodeURIComponent(storekeeperEmail)}`
        : '';
      const res = await fetch(`/api/admin/reports${emailQuery}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to load reports.');
        return;
      }

      setReport(data.report);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storekeeperEmail]);

  const estimatedRevenue = Number(report?.transactionSummary?.EstimatedRevenue || 0).toFixed(2);
  const ordersCount = Number(report?.transactionSummary?.OrdersCount || 0);

  return (
    <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-slate-700 text-xl">
              Reports for <span className="font-semibold text-blue-600">{name}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Admin operation and inventory activity summary
            </p>
          </div>
          <button
            onClick={() => router.push(`/storekeeper?name=${encodeURIComponent(name)}`)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm font-medium bg-red-100 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-500">Total Orders</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{ordersCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-500">Estimated Revenue</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">${estimatedRevenue}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Operation Status</h2>
          {loading ? (
            <p className="text-slate-500">Loading status summary...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(report?.operationStatus || []).map((status) => (
                <div key={status.Status} className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{status.Status}</p>
                  <p className="text-xl font-semibold text-slate-800">{status.Count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Admin Operations</h2>
          {loading ? (
            <p className="text-slate-500">Loading recent operations...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Entity</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">File</th>
                  <th className="py-2 pr-4">Requested</th>
                </tr>
              </thead>
              <tbody>
                {(report?.recentOperations || []).map((op) => (
                  <tr key={op.OperationID} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 pr-4">{op.OperationType}</td>
                    <td className="py-2 pr-4">{op.EntityType}</td>
                    <td className="py-2 pr-4">{op.Status}</td>
                    <td className="py-2 pr-4">{op.SourceFilename || '-'}</td>
                    <td className="py-2 pr-4">{new Date(op.RequestedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Inventory Updates</h2>
          {loading ? (
            <p className="text-slate-500">Loading inventory updates...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Storekeeper</th>
                  <th className="py-2 pr-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {(report?.recentInventoryUpdates || []).map((event, idx) => (
                  <tr key={`${event.ItemID}-${idx}`} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 pr-4">{event.ItemName || `Item ${event.ItemID}`}</td>
                    <td className="py-2 pr-4">{event.Action}</td>
                    <td className="py-2 pr-4">{event.StorekeeperEmail}</td>
                    <td className="py-2 pr-4">{new Date(event.Timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StorekeeperReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-indigo-600 p-8 flex items-center justify-center">
        <p className="text-white text-xl">Loading reports...</p>
      </div>
    }>
      <StorekeeperReportsInner />
    </Suspense>
  );
}