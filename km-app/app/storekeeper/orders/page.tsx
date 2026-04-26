'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type OrderItem = {
  ItemID: number;
  Name: string;
  Quantity: number;
  Price: number;
  LineTotal: number;
};

type OrderStatus = 'pending' | 'processing' | 'ready_for_pickup' | 'picked_up' | 'cancelled';

type StorekeeperOrder = {
  OrderID: number;
  CustomerEmail: string;
  CustomerUsername: string;
  Timestamp: string;
  Status: OrderStatus;
  CancelReason: string | null;
  TotalUnits: number;
  OrderTotal: number;
  Items: OrderItem[];
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'picked_up', label: 'Picked Up' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 8;

function statusBadge(status: OrderStatus) {
  if (status === 'cancelled') return 'bg-red-100 text-red-700';
  if (status === 'ready_for_pickup') return 'bg-emerald-100 text-emerald-700';
  if (status === 'picked_up') return 'bg-slate-200 text-slate-700';
  if (status === 'processing') return 'bg-amber-100 text-amber-700';
  return 'bg-indigo-100 text-indigo-700';
}

function StorekeeperOrdersInner() {
  const router = useRouter();
  const params = useSearchParams();
  const name = params.get('name') || 'Storekeeper';
  const email = params.get('email') || '';

  const [orders, setOrders] = useState<StorekeeperOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [statusDraftByOrder, setStatusDraftByOrder] = useState<Record<number, OrderStatus>>({});
  const [cancelReasonByOrder, setCancelReasonByOrder] = useState<Record<number, string>>({});
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageWindow = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [page, totalPages]);

  const fetchOrders = useCallback(async (nextPage: number) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/admin/orders?page=${nextPage}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to load orders.');
        return;
      }
      setOrders(data.orders ?? []);
      setTotal(Number(data.total) || 0);
      setPage(Number(data.page) || nextPage);
      setStatusDraftByOrder((prev) => {
        const next = { ...prev };
        for (const order of data.orders ?? []) {
          if (!next[order.OrderID]) {
            next[order.OrderID] = order.Status;
          }
        }
        return next;
      });
      setCancelReasonByOrder((prev) => {
        const next = { ...prev };
        for (const order of data.orders ?? []) {
          if (next[order.OrderID] == null) {
            next[order.OrderID] = order.CancelReason || '';
          }
        }
        return next;
      });
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchOrders(page);
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchOrders, page]);

  const goToPage = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    if (clamped !== page) {
      fetchOrders(clamped);
    }
  };

  const updateOrderStatus = async (order: StorekeeperOrder) => {
    const nextStatus = statusDraftByOrder[order.OrderID] || order.Status;
    const reason = (cancelReasonByOrder[order.OrderID] || '').trim();
    if (nextStatus === 'cancelled' && !reason) {
      setErrorMsg('Cancellation reason is required when cancelling an order.');
      return;
    }
    setSavingOrderId(order.OrderID);
    setErrorMsg('');
    setStatusMsg('');
    try {
      const res = await fetch(`/api/admin/orders/${order.OrderID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, cancelReason: reason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Failed to update order status.');
        return;
      }
      setStatusMsg(`Order #${order.OrderID} updated.`);
      await fetchOrders(page);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to update order status.');
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
            <p className="text-sm text-slate-500 mt-1">Detailed order queue for {name}</p>
          </div>
          <button
            onClick={() =>
              router.push(
                `/storekeeper?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
              )
            }
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
          >
            Back to Inventory
          </button>
        </div>

        {(errorMsg || statusMsg) && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              errorMsg
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            {errorMsg || statusMsg}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <p className="text-slate-500">Loading orders...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const draftStatus = statusDraftByOrder[order.OrderID] || order.Status;
              const cancelReason = cancelReasonByOrder[order.OrderID] || '';
              return (
                <div key={order.OrderID} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedOrderId(expandedOrderId === order.OrderID ? null : order.OrderID)
                    }
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-bold text-slate-900">Order #{order.OrderID}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Customer: {order.CustomerUsername} ({order.CustomerEmail})
                      </p>
                      <p className="text-xs text-slate-500">
                        Submitted: {new Date(order.Timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex text-xs font-bold px-3 py-1 rounded-full ${statusBadge(order.Status)}`}>
                        {STATUS_OPTIONS.find((s) => s.value === order.Status)?.label}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-indigo-700">
                        ${Number(order.OrderTotal).toFixed(2)}
                      </p>
                    </div>
                  </button>

                  {expandedOrderId === order.OrderID && (
                    <div className="border-t border-slate-100 p-6 space-y-5">
                      <div className="space-y-2">
                        {order.Items.map((item) => (
                          <div key={item.ItemID} className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <div>
                              <p className="font-medium text-slate-900">{item.Name}</p>
                              <p className="text-xs text-slate-500">Qty: {item.Quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">
                              ${Number(item.LineTotal).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                          value={draftStatus}
                          onChange={(e) =>
                            setStatusDraftByOrder((prev) => ({
                              ...prev,
                              [order.OrderID]: e.target.value as OrderStatus,
                            }))
                          }
                          className="px-3 py-2 rounded-lg border border-slate-300"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <input
                          value={cancelReason}
                          onChange={(e) =>
                            setCancelReasonByOrder((prev) => ({
                              ...prev,
                              [order.OrderID]: e.target.value,
                            }))
                          }
                          placeholder="Cancellation reason (required for Cancelled)"
                          className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => updateOrderStatus(order)}
                          disabled={savingOrderId === order.OrderID}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                        >
                          {savingOrderId === order.OrderID ? 'Saving...' : 'Update Status'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            {pageWindow.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-4 py-2 rounded-lg border ${
                  p === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StorekeeperOrdersPage() {
  return (
    <Suspense>
      <StorekeeperOrdersInner />
    </Suspense>
  );
}
