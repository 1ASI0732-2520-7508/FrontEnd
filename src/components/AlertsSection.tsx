import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Bell,
} from "lucide-react";
import { InventoryItem } from "../types/inventory";
import { getStockStatus, formatDate } from "../utils/stockUtils";

interface AlertsSectionProps {
  items: InventoryItem[];
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  category: "stock" | "system" | "supplier";
  title: string;
  message: string;
  item?: InventoryItem;
  timestamp: Date;
  acknowledged: boolean;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ items }) => {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [categoryFilter, setCategoryFilter] = useState<
      "all" | "stock" | "system" | "supplier"
  >("all");
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];

    items.forEach((item) => {
      const stockStatus = getStockStatus(item);

      if (stockStatus === "out-of-stock") {
        generatedAlerts.push({
          id: `out-of-stock-${item.id}`,
          type: "critical",
          category: "stock",
          title: "Out of Stock",
          message: `${item.name} is completely out of stock and needs immediate restocking.`,
          item,
          timestamp: new Date(),
          acknowledged: acknowledgedAlerts.has(`out-of-stock-${item.id}`),
        });
      } else if (stockStatus === "low-stock") {
        generatedAlerts.push({
          id: `low-stock-${item.id}`,
          type: "warning",
          category: "stock",
          title: "Low Stock Warning",
          message: `${item.name} is running low (${item.quantity} units remaining, minimum: ${item.minStock}).`,
          item,
          timestamp: new Date(item.lastUpdated),
          acknowledged: acknowledgedAlerts.has(`low-stock-${item.id}`),
        });
      }
    });

    const systemAlerts: Alert[] = [
      {
        id: "system-backup",
        type: "info",
        category: "system",
        title: "System Backup Completed",
        message: "Daily inventory backup completed successfully at 2:00 AM.",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        acknowledged: acknowledgedAlerts.has("system-backup"),
      },
      {
        id: "system-update",
        type: "info",
        category: "system",
        title: "System Update Available",
        message: "A new version of the inventory system is available for update.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        acknowledged: acknowledgedAlerts.has("system-update"),
      },
    ];

    const supplierAlerts: Alert[] = [
      {
        id: "supplier-delay",
        type: "warning",
        category: "supplier",
        title: "Supplier Delivery Delay",
        message: "TechCorp has reported a 2-day delay in their next delivery schedule.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        acknowledged: acknowledgedAlerts.has("supplier-delay"),
      },
    ];

    return [...generatedAlerts, ...systemAlerts, ...supplierAlerts].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [items, acknowledgedAlerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesType = filter === "all" || alert.type === filter;
      const matchesCategory = categoryFilter === "all" || alert.category === categoryFilter;
      return matchesType && matchesCategory;
    });
  }, [alerts, filter, categoryFilter]);

  const alertStats = useMemo(() => {
    const critical = alerts.filter((a) => a.type === "critical" && !a.acknowledged).length;
    const warning = alerts.filter((a) => a.type === "warning" && !a.acknowledged).length;
    const info = alerts.filter((a) => a.type === "info" && !a.acknowledged).length;
    const total = critical + warning + info;

    return { critical, warning, info, total };
  }, [alerts]);

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts((prev) => new Set([...prev, alertId]));
  };

  const handleAcknowledgeAll = () => {
    const allAlertIds = alerts.map((alert) => alert.id);
    setAcknowledgedAlerts(new Set(allAlertIds));
  };

  const getAlertIcon = (type: string, category: string) => {
    if (category === "stock") {
      return type === "critical" ? XCircle : TrendingDown;
    } else if (category === "system") {
      return Package;
    } else {
      return Clock;
    }
  };

  const getAlertColor = (type: string, acknowledged: boolean) => {
    if (acknowledged) {
      return "text-gray-400 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700";
    }

    switch (type) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800/50";
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-800/50";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/50";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700";
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Alerts & Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor inventory issues and system notifications
            </p>
          </div>

          {alertStats.total > 0 && (
              <button
                  onClick={handleAcknowledgeAll}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Acknowledge All</span>
              </button>
          )}
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Total Alerts",
              count: alertStats.total,
              color: "gray",
              icon: Bell,
            },
            {
              label: "Critical",
              count: alertStats.critical,
              color: "red",
              icon: XCircle,
            },
            {
              label: "Warnings",
              count: alertStats.warning,
              color: "orange",
              icon: AlertTriangle,
            },
            {
              label: "Info",
              count: alertStats.info,
              color: "blue",
              icon: Package,
            },
          ].map(({ label, count, color, icon: Icon }) => (
              <div
                  key={label}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {label}
                    </p>
                    <p
                        className={`text-3xl font-bold ${
                            color === "red"
                                ? "text-red-600 dark:text-red-400"
                                : color === "orange"
                                    ? "text-orange-600 dark:text-orange-400"
                                    : color === "blue"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-900 dark:text-gray-100"
                        }`}
                    >
                      {count}
                    </p>
                  </div>
                  <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          color === "red"
                              ? "bg-red-50 dark:bg-red-950/30"
                              : color === "orange"
                                  ? "bg-orange-50 dark:bg-orange-950/30"
                                  : color === "blue"
                                      ? "bg-blue-50 dark:bg-blue-950/30"
                                      : "bg-gray-100 dark:bg-gray-700"
                      }`}
                  >
                    <Icon
                        className={`w-6 h-6 ${
                            color === "red"
                                ? "text-red-600 dark:text-red-400"
                                : color === "orange"
                                    ? "text-orange-600 dark:text-orange-400"
                                    : color === "blue"
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-300"
                        }`}
                    />
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Priority:</label>
              <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Category:</label>
              <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Categories</option>
                <option value="stock">Stock Issues</option>
                <option value="system">System</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  All Clear!
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  No alerts match your current filters.
                </p>
              </div>
          ) : (
              filteredAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.type, alert.category);
                const colorClasses = getAlertColor(alert.type, alert.acknowledged);

                return (
                    <div
                        key={alert.id}
                        className={`bg-white dark:bg-gray-800 rounded-xl border p-6 transition-all duration-200 border-gray-200 dark:border-gray-700 ${
                            alert.acknowledged ? "opacity-60" : "hover:shadow-lg"
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colorClasses}`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3
                                  className={`text-lg font-semibold ${
                                      alert.acknowledged
                                          ? "text-gray-500 dark:text-gray-400"
                                          : "text-gray-900 dark:text-gray-100"
                                  }`}
                              >
                                {alert.title}
                              </h3>
                              <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colorClasses}`}
                              >
                          {alert.type}
                        </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium capitalize">
                          {alert.category}
                        </span>
                              {alert.acknowledged && (
                                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            Acknowledged
                          </span>
                              )}
                            </div>

                            <p
                                className={`text-sm mb-3 ${
                                    alert.acknowledged
                                        ? "text-gray-400 dark:text-gray-500"
                                        : "text-gray-600 dark:text-gray-300"
                                }`}
                            >
                              {alert.message}
                            </p>

                            {alert.item && (
                                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Item:</span>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {alert.item.name}
                                      </p>
                                    </div>
                                    <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Current Stock:
                              </span>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {alert.item.quantity} units
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Min Stock:</span>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {alert.item.minStock} units
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
                                      <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {alert.item.supplier}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(alert.timestamp)} at{" "}
                                {alert.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {!alert.acknowledged && (
                            <button
                                onClick={() => handleAcknowledge(alert.id)}
                                className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Acknowledge</span>
                            </button>
                        )}
                      </div>
                    </div>
                );
              })
          )}
        </div>
      </div>
  );
};
