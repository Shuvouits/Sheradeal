"use client";

import { useState } from "react";
import {
  Store,
  Globe,
  ShoppingBag,
  BadgePercent,
  UsersRound,
  RefreshCcw,
  CalendarDays,
  ChartNoAxesColumn,
  Megaphone,
  PanelsTopLeft,
  ChevronRight,
  ArrowUpRight,
  Plus,
} from "lucide-react";

import DashboardExtras from "@/components/admin/DashboardExtras";

const metrics = [
  { label: "In-store sales", value: "৳0.00", detail: "0 orders", icon: Store },
  { label: "Website sales", value: "৳0.00", detail: "0 orders", icon: Globe },
  { label: "Total orders", value: "0", detail: "0 orders", icon: ShoppingBag },
  { label: "Discount", value: "৳0.00", detail: "0 orders", icon: BadgePercent },
  { label: "Customers", value: "0", detail: "Awaiting API data", icon: UsersRound },
  { label: "Refunds", value: "৳0.00", detail: "0 refunds", icon: RefreshCcw },
];

const hours = [
  "01:00 AM",
  "03:00 AM",
  "05:00 AM",
  "07:00 AM",
  "09:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM",
  "05:00 PM",
  "07:00 PM",
  "09:00 PM",
  "11:00 PM",
];

export default function DashboardOverview() {
  const [period, setPeriod] = useState("Today");
  const [chartTab, setChartTab] = useState("Orders");

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="sd-dashboard">
      <div className="sd-dashboard-heading">
        <div>
          <h1>{greeting}, Store.</h1>
          <p>Here's what's happening with your store today.</p>
        </div>

        <div className="sd-dashboard-actions">
          <div className="sd-date-select">
            <CalendarDays size={17} />

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              aria-label="Dashboard date range"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <span className="sd-dash-action">
            <ChartNoAxesColumn size={17} />
            Analytics
            <ArrowUpRight size={15} />
          </span>

          <span className="sd-dash-action primary">
            <ShoppingBag size={17} />
            Orders
            <ArrowUpRight size={15} />
          </span>
        </div>
      </div>

      <div className="sd-metrics-grid">
        {metrics.map((item) => {
          const Icon = item.icon;

          return (
            <div className="sd-metric-card" key={item.label}>
              <div className="sd-metric-header">
                <span>{item.label}</span>
                <Icon size={17} strokeWidth={1.8} />
              </div>

              <div className="sd-metric-value">{item.value}</div>

              <div className="sd-metric-detail">{item.detail}</div>
            </div>
          );
        })}
      </div>

      <div className="sd-orders-card">
        <div className="sd-orders-heading">
          <div>
            <h2>Orders</h2>
            <p>Hourly · {today}</p>
          </div>

          <span className="sd-add-activity">
            <Plus size={17} />
            Add activity
          </span>
        </div>

        <div className="sd-orders-content">
          <div className="sd-chart-section">
            <div className="sd-chart-area">
              <div className="sd-chart-y-axis">
                {[4, 3, 2, 1, 0].map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>

              <div className="sd-chart-main">
                <div className="sd-chart-grid">
                  {[4, 3, 2, 1, 0].map((value) => (
                    <div key={value} className="sd-chart-grid-line" />
                  ))}
                </div>

                <div className="sd-chart-x-axis">
                  {hours.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="sd-chart-legend">
              <span>
                <i className="sd-legend-instore" />
                In-store
              </span>

              <span>
                <i className="sd-legend-online" />
                Online
              </span>
            </div>

            <div className="sd-chart-note">
              Chart data will appear after connecting the Laravel reporting API.
            </div>
          </div>

          <aside className="sd-orders-summary">
            <div className="sd-summary-tabs">
              {["Orders", "Sales"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setChartTab(tab)}
                  className={chartTab === tab ? "active" : ""}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="sd-summary-value">
              {chartTab === "Orders" ? "0" : "৳0.00"}
            </div>

            <div className="sd-summary-progress" />

            <div className="sd-summary-channels">
              <span>
                <i className="sd-legend-instore" />
                In-store 0
              </span>

              <span>
                <i className="sd-legend-online" />
                Online 0
              </span>
            </div>

            <p className="sd-summary-description">
              Totals for the selected period, split by sales channel.
            </p>

            <div className="sd-summary-links">
              <div>
                <span>
                  <Megaphone size={18} />
                  Show all highlights
                </span>

                <ChevronRight size={17} />
              </div>

              <div>
                <span>
                  <PanelsTopLeft size={18} />
                  Show all sales data
                </span>

                <ChevronRight size={17} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <DashboardExtras />

      <style>{`
        .sd-dashboard {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          font-family: "Segoe UI", Arial, sans-serif;
          color: #202124;
        }

        .sd-dashboard *,
        .sd-dashboard *::before,
        .sd-dashboard *::after {
          box-sizing: border-box;
        }

        .sd-dashboard-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 18px;
        }

        .sd-dashboard-heading h1 {
          margin: 0 0 3px;
          font-size: 24px;
          font-weight: 650;
          letter-spacing: -0.7px;
          line-height: 1.35;
          color: #161616;
        }

        .sd-dashboard-heading p {
          margin: 0;
          font-size: 13px;
          color: #777777;
        }

        .sd-dashboard-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .sd-date-select,
        .sd-dash-action,
        .sd-add-activity {
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 13px;
          background: #ffffff;
          border: 1px solid #e3e3e3;
          border-radius: 9px;
          color: #202124;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.025);
        }

        .sd-date-select svg {
          color: #777777;
        }

        .sd-date-select select {
          border: none;
          outline: none;
          background: transparent;
          color: #202124;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
        }

        .sd-dash-action.primary {
          background: var(--brand-primary);
          border-color: var(--brand-primary);
          color: #ffffff;
        }

        .sd-metrics-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 15px;
        }

        .sd-metric-card {
          min-width: 0;
          min-height: 102px;
          padding: 16px;
          background: #ffffff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
        }

        .sd-metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #777777;
          font-size: 12px;
        }

        .sd-metric-header svg {
          flex-shrink: 0;
        }

        .sd-metric-value {
          margin-top: 10px;
          color: #111111;
          font-size: 21px;
          line-height: 1.2;
          font-weight: 650;
          letter-spacing: -0.5px;
        }

        .sd-metric-detail {
          margin-top: 5px;
          color: #858585;
          font-size: 11px;
        }

        .sd-orders-card {
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e6e6e6;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.035);
        }

        .sd-orders-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 20px 0;
        }

        .sd-orders-heading h2 {
          margin: 0 0 3px;
          font-size: 17px;
          font-weight: 650;
          color: #1c1c1c;
        }

        .sd-orders-heading p {
          margin: 0;
          color: #777777;
          font-size: 12px;
        }

        .sd-add-activity {
          height: 33px;
          font-size: 12px;
        }

        .sd-orders-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 310px;
          margin-top: 17px;
        }

        .sd-chart-section {
          min-width: 0;
          padding: 24px 23px 20px;
        }

        .sd-chart-area {
          display: flex;
          height: 345px;
          gap: 12px;
        }

        .sd-chart-y-axis {
          width: 24px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding-bottom: 28px;
          text-align: right;
          color: #777777;
          font-size: 11px;
        }

        .sd-chart-main {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .sd-chart-grid {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sd-chart-grid-line {
          width: 100%;
          height: 1px;
          background: #e7e7e7;
        }

        .sd-chart-x-axis {
          height: 28px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 3px;
        }

        .sd-chart-x-axis span {
          color: #858585;
          font-size: 10px;
          white-space: nowrap;
        }

        .sd-chart-legend {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 18px;
          margin-top: 18px;
          color: #858585;
          font-size: 11px;
        }

        .sd-chart-legend span,
        .sd-summary-channels span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .sd-legend-instore,
        .sd-legend-online {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 2px;
          background: var(--brand-primary);
        }

        .sd-legend-online {
          background: #bcbcbc;
        }

        .sd-chart-note {
          margin-top: 16px;
          text-align: center;
          color: #999999;
          font-size: 11px;
        }

        .sd-orders-summary {
          min-width: 0;
          padding: 0 19px 25px;
          border-left: 1px solid #e7e7e7;
        }

        .sd-summary-tabs {
          display: flex;
          align-items: center;
          gap: 23px;
          border-bottom: 1px solid #e6e6e6;
        }

        .sd-summary-tabs button {
          position: relative;
          min-height: 51px;
          padding: 0 0 3px;
          background: transparent;
          border: none;
          color: #777777;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
        }

        .sd-summary-tabs button.active {
          color: #161616;
          font-weight: 650;
        }

        .sd-summary-tabs button.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--brand-primary);
        }

        .sd-summary-value {
          margin-top: 22px;
          font-size: 25px;
          font-weight: 650;
          color: #111111;
        }

        .sd-summary-progress {
          width: 100%;
          height: 8px;
          margin: 18px 0 10px;
          border-radius: 8px;
          background: #f0f0f0;
        }

        .sd-summary-channels {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #777777;
          font-size: 11px;
        }

        .sd-summary-description {
          margin: 22px 0;
          color: #777777;
          font-size: 13px;
          line-height: 1.8;
        }

        .sd-summary-links {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .sd-summary-links > div {
          min-height: 49px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 12px;
          border: 1px solid #e5e5e5;
          border-radius: 15px;
          color: #252525;
          font-size: 12px;
        }

        .sd-summary-links > div > span {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sd-summary-links > div > span svg {
          color: var(--brand-primary);
        }

        .sd-summary-links > div > svg {
          color: #888888;
        }

        @media (max-width: 1450px) {
          .sd-metrics-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .sd-chart-x-axis span:nth-child(even) {
            display: none;
          }
        }

        @media (max-width: 1100px) {
          .sd-orders-content {
            grid-template-columns: 1fr;
          }

          .sd-orders-summary {
            border-left: none;
            border-top: 1px solid #e7e7e7;
            padding-top: 12px;
          }
        }

        @media (max-width: 650px) {
          .sd-dashboard-heading h1 {
            font-size: 21px;
          }

          .sd-dashboard-actions {
            width: 100%;
          }

          .sd-dash-action {
            padding: 0 9px;
            font-size: 11px;
          }

          .sd-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
          }

          .sd-metric-card {
            padding: 12px;
          }

          .sd-metric-header {
            font-size: 11px;
          }

          .sd-metric-value {
            font-size: 19px;
          }

          .sd-orders-heading {
            padding: 16px 14px 0;
          }

          .sd-chart-section {
            padding: 20px 12px;
          }

          .sd-chart-area {
            height: 260px;
          }

          .sd-chart-x-axis span {
            display: none;
          }

          .sd-chart-x-axis span:first-child,
          .sd-chart-x-axis span:nth-child(6),
          .sd-chart-x-axis span:last-child {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
