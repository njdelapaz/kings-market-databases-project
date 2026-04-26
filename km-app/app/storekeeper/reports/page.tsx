'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

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
    ActionLabel?: string;
    Timestamp: string;
  }>;
  transactionSummary: {
    OrdersCount: number;
    EstimatedRevenue: string | number;
  };
  itemRequestSummary: {
    statusCounts: Array<{ Status: string; Count: number }>;
    recent: Array<{
      ID: number;
      CustomerEmail: string;
      Name: string;
      Status: string;
      ReviewedBy: string | null;
      ReviewedAt: string | null;
    }>;
  };
  topSellingItems: Array<{
    ItemID: number;
    ItemName: string;
    UnitsSold: number;
    Revenue: number | string;
    SalesRank: number;
    RevenueSharePct: number | string;
  }>;
};

function StorekeeperReportsInner() {
  const router = useRouter();
  const [name,             setName]             = useState('Storekeeper');
  const [storekeeperEmail, setStorekeeperEmail] = useState('');

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setName(data.username ?? 'Storekeeper');
          setStorekeeperEmail(data.email ?? '');
        }
      })
      .catch(() => {});
  }, []);

  async function getReportData() {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/admin/reports');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            onClick={() => router.push('/storekeeper')}
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

        {/* Item Request Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Selling Items (Last 30 Days)</h2>
          {loading ? (
            <p className="text-slate-500">Loading sales analytics...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Units Sold</th>
                  <th className="py-2 pr-4">Revenue</th>
                  <th className="py-2 pr-4">Revenue Share</th>
                </tr>
              </thead>
              <tbody>
                {(report?.topSellingItems || []).map((row) => (
                  <tr key={row.ItemID} className="border-b border-slate-100 text-slate-700">
                    <td className="py-2 pr-4">#{row.SalesRank}</td>
                    <td className="py-2 pr-4">{row.ItemName}</td>
                    <td className="py-2 pr-4">{row.UnitsSold}</td>
                    <td className="py-2 pr-4">${Number(row.Revenue).toFixed(2)}</td>
                    <td className="py-2 pr-4">{Number(row.RevenueSharePct).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Item Request Summary</h2>
            <a href="/storekeeper/item-requests" className="text-sm text-indigo-600 font-semibold hover:underline">
              Manage Requests →
            </a>
          </div>
          {loading ? (
            <p className="text-slate-500">Loading item requests...</p>
          ) : (
            <>
              <div className="flex gap-3 flex-wrap mb-5">
                {(['pending','approved','rejected'] as const).map(s => {
                  const row = report?.itemRequestSummary?.statusCounts?.find(r => r.Status === s);
                  const count = Number(row?.Count ?? 0);
                  const colours: Record<string, string> = {
                    pending:  'bg-amber-50  border-amber-200  text-amber-700',
                    approved: 'bg-green-50  border-green-200  text-green-700',
                    rejected: 'bg-red-50    border-red-200    text-red-700',
                  };
                  return (
                    <div key={s} className={`flex-1 min-w-[100px] rounded-xl border px-4 py-3 ${colours[s]}`}>
                      <p className="text-xs uppercase tracking-wide font-semibold">{s}</p>
                      <p className="text-2xl font-bold mt-0.5">{count}</p>
                    </div>
                  );
                })}
              </div>
              {(report?.itemRequestSummary?.recent?.length ?? 0) > 0 && (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-4">Item</th>
                      <th className="py-2 pr-4">Customer</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Reviewed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report?.itemRequestSummary?.recent?.map(req => (
                      <tr key={req.ID} className="border-b border-slate-100 text-slate-700">
                        <td className="py-2 pr-4">{req.Name}</td>
                        <td className="py-2 pr-4">{req.CustomerEmail}</td>
                        <td className="py-2 pr-4 capitalize">{req.Status}</td>
                        <td className="py-2 pr-4">{req.ReviewedBy ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
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
                    <td className="py-2 pr-4">{event.ActionLabel || event.Action}</td>
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