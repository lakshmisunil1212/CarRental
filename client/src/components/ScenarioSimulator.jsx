import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Calendar, BarChart3, Target, Zap } from "lucide-react";

export default function ScenarioSimulator() {
  const [scenarios, setScenarios] = useState([
    {
      id: 1,
      name: "Current Strategy",
      basePrice: 1500,
      occupancyRate: 75,
      discountRate: 10,
      seasonalMultiplier: 1.0,
      timePeriod: "monthly",
      color: "bg-blue-500"
    },
    {
      id: 2,
      name: "Price Increase",
      basePrice: 1800,
      occupancyRate: 70,
      discountRate: 8,
      seasonalMultiplier: 1.0,
      timePeriod: "monthly",
      color: "bg-green-500"
    }
  ]);

  const [fleetSize, setFleetSize] = useState(10);
  const [results, setResults] = useState([]);

  // Calculate revenue for a scenario
  const calculateRevenue = (scenario) => {
    const { basePrice, occupancyRate, discountRate, seasonalMultiplier, timePeriod } = scenario;

    // Effective daily price after discounts
    const effectivePrice = basePrice * (1 - discountRate / 100) * seasonalMultiplier;

    // Days per period
    const daysInPeriod = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365
    }[timePeriod];

    // Revenue per car per period
    const revenuePerCar = effectivePrice * (occupancyRate / 100) * daysInPeriod;

    // Total fleet revenue
    const totalRevenue = revenuePerCar * fleetSize;

    // Additional metrics
    const totalDays = daysInPeriod * fleetSize;
    const bookedDays = totalDays * (occupancyRate / 100);
    const avgRevenuePerDay = totalRevenue / totalDays;

    return {
      revenuePerCar,
      totalRevenue,
      bookedDays,
      totalDays,
      avgRevenuePerDay,
      utilizationRate: occupancyRate
    };
  };

  // Update results when scenarios or fleet size change
  useEffect(() => {
    const newResults = scenarios.map(scenario => ({
      ...scenario,
      calculations: calculateRevenue(scenario)
    }));
    setResults(newResults);
  }, [scenarios, fleetSize]);

  const addScenario = () => {
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500", "bg-indigo-500"];
    const newScenario = {
      id: Date.now(),
      name: `Scenario ${scenarios.length + 1}`,
      basePrice: 1500,
      occupancyRate: 75,
      discountRate: 10,
      seasonalMultiplier: 1.0,
      timePeriod: "monthly",
      color: colors[scenarios.length % colors.length]
    };
    setScenarios([...scenarios, newScenario]);
  };

  const updateScenario = (id, field, value) => {
    setScenarios(scenarios.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const removeScenario = (id) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-sky-100 rounded-xl">
            <Calculator className="text-sky-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">What-if Scenario Simulator</h2>
            <p className="text-slate-500">Simulate revenue under different pricing and occupancy assumptions</p>
          </div>
        </div>

        {/* Fleet Size Input */}
        <div className="flex items-center gap-4">
          <label className="font-medium text-slate-700">Fleet Size:</label>
          <input
            type="number"
            value={fleetSize}
            onChange={(e) => setFleetSize(Math.max(1, parseInt(e.target.value) || 1))}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200 w-24"
            min="1"
          />
          <span className="text-slate-500">cars</span>
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid lg:grid-cols-2 gap-6">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${scenario.color}`}></div>
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => updateScenario(scenario.id, 'name', e.target.value)}
                  className="font-bold text-lg text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0"
                />
              </div>
              {scenarios.length > 1 && (
                <button
                  onClick={() => removeScenario(scenario.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scenario Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Base Price (₹/day)</label>
                  <input
                    type="number"
                    value={scenario.basePrice}
                    onChange={(e) => updateScenario(scenario.id, 'basePrice', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Occupancy (%)</label>
                  <input
                    type="number"
                    value={scenario.occupancyRate}
                    onChange={(e) => updateScenario(scenario.id, 'occupancyRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={scenario.discountRate}
                    onChange={(e) => updateScenario(scenario.id, 'discountRate', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Seasonal Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scenario.seasonalMultiplier}
                    onChange={(e) => updateScenario(scenario.id, 'seasonalMultiplier', parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Time Period</label>
                <select
                  value={scenario.timePeriod}
                  onChange={(e) => updateScenario(scenario.id, 'timePeriod', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Results */}
            {results.find(r => r.id === scenario.id) && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Target size={16} />
                  Projected Results
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Revenue per Car</p>
                    <p className="font-bold text-slate-800">{formatCurrency(results.find(r => r.id === scenario.id).calculations.revenuePerCar)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Total Fleet Revenue</p>
                    <p className="font-bold text-green-600">{formatCurrency(results.find(r => r.id === scenario.id).calculations.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Booked Days</p>
                    <p className="font-bold text-slate-800">{results.find(r => r.id === scenario.id).calculations.bookedDays.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Avg Revenue/Day</p>
                    <p className="font-bold text-slate-800">{formatCurrency(results.find(r => r.id === scenario.id).calculations.avgRevenuePerDay)}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add Scenario Button */}
      <div className="text-center">
        <button
          onClick={addScenario}
          className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-500 transition-all shadow-lg shadow-sky-200 flex items-center gap-2 mx-auto"
        >
          <Zap size={20} />
          Add New Scenario
        </button>
      </div>

      {/* Comparison Chart */}
      {results.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-md border border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-sky-600" />
            Scenario Comparison
          </h3>

          <div className="space-y-4">
            {results.map((result, index) => {
              const maxRevenue = Math.max(...results.map(r => r.calculations.totalRevenue));
              const percentage = (result.calculations.totalRevenue / maxRevenue) * 100;

              return (
                <div key={result.id} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-slate-700 truncate">
                    {result.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-6">
                        <div
                          className={`h-6 rounded-full transition-all duration-500 ${result.color.replace('bg-', 'bg-').replace('-500', '-400')}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-bold text-slate-800 min-w-[100px] text-right">
                        {formatCurrency(result.calculations.totalRevenue)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-600 text-sm">Best Performing</p>
              <p className="font-bold text-green-600">
                {results.reduce((best, current) =>
                  current.calculations.totalRevenue > best.calculations.totalRevenue ? current : best
                ).name}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-600 text-sm">Revenue Difference</p>
              <p className="font-bold text-slate-800">
                {formatCurrency(
                  Math.max(...results.map(r => r.calculations.totalRevenue)) -
                  Math.min(...results.map(r => r.calculations.totalRevenue))
                )}
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-600 text-sm">Avg Utilization</p>
              <p className="font-bold text-blue-600">
                {(results.reduce((sum, r) => sum + r.calculations.utilizationRate, 0) / results.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}