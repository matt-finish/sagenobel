"use client";

import { useState } from "react";
import { updateOrderStatus, addTracking } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/utils";
import { Download, Truck } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  email: string;
  full_name: string;
  status: string;
  total_cents: number;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_price_cents: number;
    quantity: number;
    custom_field_values: Record<string, string>;
  }[];
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "in_progress", label: "In Progress" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "complete", label: "Complete" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  fulfilled: "bg-purple-100 text-purple-800",
  complete: "bg-green-100 text-green-800",
};

export function AdminOrders({ orders }: { orders: Order[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("usps");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  }

  function toggleAll() {
    if (selected.size === filteredOrders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredOrders.map((o) => o.id)));
    }
  }

  async function handleStatusChange(orderId: string, status: string) {
    await updateOrderStatus(orderId, status);
  }

  async function handleAddTracking() {
    if (!trackingModal || !trackingNumber) return;
    await addTracking(trackingModal, trackingNumber, carrier);
    setTrackingModal(null);
    setTrackingNumber("");
  }

  function handleExport() {
    const ids = selected.size > 0 ? Array.from(selected).join(",") : "";
    const url = ids
      ? `/api/export/orders?ids=${ids}`
      : "/api/export/orders";
    window.open(url, "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Orders</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background-alt transition-colors"
        >
          <Download size={16} />
          Export CSV {selected.size > 0 && `(${selected.size})`}
        </button>
      </div>

      <div className="flex gap-2">
        {["all", ...statusOptions.map((s) => s.value)].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === status
                ? "bg-sage text-white"
                : "bg-background border border-border text-foreground-muted hover:text-foreground"
            }`}
          >
            {status === "all" ? "All" : statusOptions.find((s) => s.value === status)?.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-background rounded-xl border border-border p-12 text-center">
          <p className="text-foreground-muted">No orders found.</p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border text-sage focus:ring-sage"
                  />
                </th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Tracking</th>
                <th className="px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="rounded border-border text-sage focus:ring-sage"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      {order.order_number}
                    </span>
                    <div className="text-xs text-foreground-muted mt-0.5">
                      {order.order_items.length} item(s)
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{order.full_name}</span>
                    <div className="text-xs text-foreground-muted">{order.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {formatPrice(order.total_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 ${statusColors[order.status] || "bg-gray-100"}`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {order.tracking_number ? (
                      <a
                        href={order.tracking_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sage hover:text-sage-dark font-medium"
                      >
                        {order.tracking_carrier?.toUpperCase()} - {order.tracking_number}
                      </a>
                    ) : (
                      <button
                        onClick={() => setTrackingModal(order.id)}
                        className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-sage font-medium"
                      >
                        <Truck size={12} />
                        Add Tracking
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border border-border p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Add Tracking Number
            </h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Carrier
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              >
                <option value="usps">USPS</option>
                <option value="ups">UPS</option>
                <option value="fedex">FedEx</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-foreground focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                placeholder="Enter tracking number"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setTrackingModal(null);
                  setTrackingNumber("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-background-alt transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTracking}
                disabled={!trackingNumber}
                className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark transition-colors disabled:opacity-50"
              >
                Save Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
