import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Car, Users, Calendar, ArrowLeft, BarChart3, PieChart, Calculator, MapPin, CloudSun, Clock3 } from "lucide-react";
import ScenarioSimulator from "../../components/ScenarioSimulator.jsx";
import { getAdminPricingInsights, getAdminReportsInsights } from "../../services/api";

export default function AdminReports() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("month");
  const [activeTab, setActiveTab] = useState("reports");
  const [reportsInsights, setReportsInsights] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [pricingInsights, setPricingInsights] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState("");

  useEffect(() => {
    if (activeTab !== "reports") return;
    getAdminReportsInsights(dateRange)
      .then((data) => {
        setReportsInsights(data);
        setReportsError("");
      })
      .catch((err) => setReportsError(err.message || "Failed to load reports and analytics"))
      .finally(() => setReportsLoading(false));
  }, [activeTab, dateRange]);

  useEffect(() => {
    if (activeTab !== "pricing") return;
    getAdminPricingInsights(dateRange)
      .then((data) => {
        setPricingInsights(data);
        setPricingError("");
      })
      .catch((err) => setPricingError(err.message || "Failed to load pricing dashboard"))
      .finally(() => setPricingLoading(false));
  }, [activeTab, dateRange]);

  const revenueData = useMemo(() => ({
    total: reportsInsights?.totalRevenue || 0,
    realized: reportsInsights?.realizedRevenue || 0,
    growth: reportsInsights?.growth || 0,
    trend: reportsInsights?.revenueTrend || [],
  }), [reportsInsights]);

  const bookingStats = useMemo(() => ({
    total: reportsInsights?.bookingStats?.total || 0,
    completed: reportsInsights?.bookingStats?.completed || 0,
    pending: reportsInsights?.bookingStats?.pending || 0,
    cancelled: reportsInsights?.bookingStats?.cancelled || 0,
  }), [reportsInsights]);

  const carUtilization = reportsInsights?.carUtilization || [];
  const topCustomers = reportsInsights?.topCustomers || [];
  const maxTrendRevenue = Math.max(...revenueData.trend.map((point) => point.revenue), 0);
  const trendLabel = dateRange === "quarter"
    ? "Revenue by Week"
    : dateRange === "year"
      ? "Revenue by Month"
      : "Revenue by Day";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="text-slate-500">Business performance insights and metrics</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6">
        <div className="flex gap-2">
          {[
            { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
            { id: "simulator", label: "Scenario Simulator", icon: Calculator },
            { id: "pricing", label: "Pricing Dashboard", icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "reports") setReportsLoading(true);
                if (tab.id === "pricing") setPricingLoading(true);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Content Rendering */}
      {activeTab === "reports" ? (
        <>
          {/* Date Range Filter */}
          <div className="flex gap-2 bg-white p-4 rounded-xl border border-slate-200">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  setReportsLoading(true);
                  setPricingLoading(true);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  dateRange === range
                    ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {reportsLoading && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600">Loading reports...</div>
          )}

          {reportsError && !reportsLoading && (
            <div className="bg-white p-6 rounded-xl border border-rose-200 text-rose-600">{reportsError}</div>
          )}

          {!reportsLoading && !reportsError && reportsInsights && (
            <>

      {/* Revenue Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-slate-600 text-sm font-medium uppercase">Total Revenue</p>
            <h2 className="text-4xl font-bold text-slate-800 mt-2">₹{revenueData.total.toLocaleString()}</h2>
            <p className="text-sm text-slate-500 mt-2">Realized revenue: ₹{revenueData.realized.toLocaleString()}</p>
            <div className={`flex items-center gap-2 mt-2 ${revenueData.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {revenueData.growth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span className="font-semibold">{Math.abs(revenueData.growth)}% {revenueData.growth >= 0 ? "increase" : "decrease"}</span>
            </div>
          </div>
          <BarChart3 size={40} className="text-sky-400 opacity-50" />
        </div>

        {/* Mini Revenue Chart */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700">{trendLabel}</h3>
          {revenueData.trend.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
              No revenue trend data available for this range.
            </div>
          ) : (
          <div className="flex items-end justify-between gap-2 h-32">
            {revenueData.trend.map((data, index) => {
              const heightPercent = maxTrendRevenue > 0 ? (data.revenue / maxTrendRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg transition-all hover:shadow-lg"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <p className="text-xs font-medium text-slate-600 mt-2">{data.label}</p>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Total Bookings</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{bookingStats.total}</p>
            </div>
            <Calendar className="text-blue-400 opacity-50" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{bookingStats.completed}</p>
            </div>
            <TrendingUp className="text-emerald-400 opacity-50" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{bookingStats.pending}</p>
            </div>
            <PieChart className="text-amber-400 opacity-50" size={32} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-xs font-medium uppercase">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{bookingStats.cancelled}</p>
            </div>
            <TrendingDown className="text-red-400 opacity-50" size={32} />
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Car Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Car size={20} className="text-sky-600" /> Vehicle Utilization
          </h3>
          <div className="space-y-4">
            {carUtilization.length === 0 && (
              <p className="text-sm text-slate-500">No utilization data for this range.</p>
            )}
            {carUtilization.map((car, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-slate-700">{car.carName}</p>
                  <p className="text-sm text-slate-600">{car.utilization}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-sky-400 h-2 rounded-full transition-all"
                    style={{ width: `${car.utilization}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{car.bookings} bookings</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-sky-600" /> Top Customers
          </h3>
          <div className="space-y-4">
            {topCustomers.length === 0 && (
              <p className="text-sm text-slate-500">No customer spend data for this range.</p>
            )}
            {topCustomers.map((customer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{customer.name}</p>
                  <p className="text-xs text-slate-500">{customer.bookings} bookings</p>
                </div>
                <p className="font-bold text-sky-600">₹{customer.totalSpent.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
            </>
          )}
        </>
      ) : activeTab === "simulator" ? (
        <ScenarioSimulator />
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Dynamic Pricing Dashboard</h3>
            <p className="text-sm text-slate-500">Factor breakdown across location, time-of-day, and weather.</p>
          </div>

          {pricingLoading && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-600">Loading pricing insights...</div>
          )}

          {pricingError && !pricingLoading && (
            <div className="bg-white p-6 rounded-xl border border-rose-200 text-rose-600">{pricingError}</div>
          )}

          {!pricingLoading && !pricingError && pricingInsights && (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Dynamic Bookings</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{pricingInsights.totalDynamicBookings || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Avg Combined Factor</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{(pricingInsights.averages?.combinedFactor || 1).toFixed(2)}x</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Avg Price Uplift</p>
                  <p className="text-3xl font-bold text-emerald-700 mt-1">{(pricingInsights.averages?.avgUpliftPercent || 0).toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-sky-600" /> By Location</h4>
                  <div className="space-y-3">
                    {(pricingInsights.byLocation || []).slice(0, 6).map((row) => (
                      <div key={row.location} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between text-sm"><span className="font-semibold text-slate-700">{row.location}</span><span className="text-slate-500">{row.count} bookings</span></div>
                        <div className="text-xs text-slate-500 mt-1">Avg factor {row.avgCombined.toFixed(2)}x | Avg price INR {Math.round(row.avgDynamicPrice)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock3 size={18} className="text-amber-600" /> By Time</h4>
                  <div className="space-y-3">
                    {(pricingInsights.byTimeBucket || []).map((row) => (
                      <div key={row.bucket} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between text-sm"><span className="font-semibold text-slate-700 capitalize">{row.bucket}</span><span className="text-slate-500">{row.count} bookings</span></div>
                        <div className="text-xs text-slate-500 mt-1">Avg factor {row.avgFactor.toFixed(2)}x</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CloudSun size={18} className="text-cyan-600" /> By Weather</h4>
                  <div className="space-y-3">
                    {(pricingInsights.byWeather || []).map((row) => (
                      <div key={row.weather} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between text-sm"><span className="font-semibold text-slate-700 capitalize">{row.weather}</span><span className="text-slate-500">{row.count} bookings</span></div>
                        <div className="text-xs text-slate-500 mt-1">Avg factor {row.avgFactor.toFixed(2)}x</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
