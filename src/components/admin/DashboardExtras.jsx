"use client";

import {
  Package,
  ShoppingBag,
  UsersRound,
  Eye,
  ChevronRight,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";

const money = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function ProductImage({ src, name }) {
  return (
    <div className="sd-extra-product-image">
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <ImageIcon size={23} strokeWidth={1.5} />
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="sd-extra-empty">
      <span className="sd-extra-empty-icon">
        <Icon size={25} strokeWidth={1.5} />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function RecentOrders({ orders }) {
  return (
    <section className="sd-extra-card">
      <div className="sd-extra-heading">
        <h2>Recent Orders</h2>
        <button type="button" disabled title="Orders module coming soon">
          View all orders <ChevronRight size={15} />
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No recent orders"
          description="Your latest customer orders will appear here."
        />
      ) : (
        <div className="sd-extra-orders-list">
          {orders.map((order) => (
            <div className="sd-extra-order" key={order.id}>
              <div className="sd-extra-order-product">
                <ProductImage
                  src={order.image}
                  name={order.productName}
                />

                <div>
                  <strong>{order.productName}</strong>
                  <small>{order.orderNumber}</small>
                </div>
              </div>

              <div className="sd-extra-cell">
                <small>Customer</small>
                <strong>{order.customer}</strong>
              </div>

              <div className="sd-extra-cell">
                <small>Qty</small>
                <strong>{order.quantity} Pcs</strong>
              </div>

              <div className="sd-extra-cell">
                <small>Status</small>
                <span
                  className={`sd-extra-status ${
                    order.status === "Delivered"
                      ? "delivered"
                      : order.status === "Pending"
                      ? "pending"
                      : "neutral"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="sd-extra-cell">
                <small>Payment Method</small>
                <strong className="sd-extra-payment">
                  <CreditCard size={14} />
                  {order.paymentMethod}
                </strong>
              </div>

              <div className="sd-extra-cell sd-extra-total">
                <small>Total Price</small>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LatestProducts({ products }) {
  return (
    <section className="sd-extra-card sd-extra-bottom-card">
      <div className="sd-extra-heading">
        <h2>Latest Products</h2>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Recently added products will appear here."
        />
      ) : (
        <div className="sd-extra-products">
          {products.map((product) => (
            <div className="sd-extra-product-row" key={product.id}>
              <ProductImage src={product.image} name={product.name} />
              <strong>{product.name}</strong>
              <span>{money(product.price)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function VisitorChart({ visitorSeries }) {
  const hasData = visitorSeries.length > 0;

  const width = 640;
  const height = 260;
  const left = 42;
  const right = 12;
  const top = 20;
  const bottom = 30;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const maxValue = Math.max(
    1,
    ...visitorSeries.flatMap((item) => [
      Number(item.visitors || 0),
      Number(item.pageviews || 0),
    ])
  );

  const chartMax = Math.ceil(maxValue / 4) * 4;

  const buildPoints = (key) => {
    return visitorSeries
      .map((item, index) => {
        const x =
          left +
          (visitorSeries.length === 1
            ? plotWidth / 2
            : (index / (visitorSeries.length - 1)) * plotWidth);

        const y =
          top +
          plotHeight -
          (Number(item[key] || 0) / chartMax) * plotHeight;

        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="sd-extra-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Visitors and pageviews chart"
      >
        {[0, 1, 2, 3, 4].map((step) => {
          const y = top + (step / 4) * plotHeight;
          const value = Math.round(chartMax * (1 - step / 4));

          return (
            <g key={step}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#e8e8e8"
                strokeWidth="1"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#858585"
              >
                {hasData ? value : ""}
              </text>
            </g>
          );
        })}

        {hasData && (
          <>
            <polyline
              points={buildPoints("pageviews")}
              fill="none"
              stroke="#777777"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <polyline
              points={buildPoints("visitors")}
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {!hasData && (
        <div className="sd-extra-chart-empty">
          <Eye size={22} />
          <span>No visitor analytics available yet</span>
        </div>
      )}

      <div className="sd-extra-chart-legend">
        <span><i className="visitors" /> Visitors</span>
        <span><i className="pageviews" /> Pageviews</span>
      </div>
    </div>
  );
}

function TotalVisitors({ visitorStats, visitorSeries }) {
  const hasStats = visitorStats !== null;

  return (
    <section className="sd-extra-card sd-extra-bottom-card">
      <div className="sd-extra-heading">
        <h2>Total Visitors</h2>
        <span className="sd-extra-muted">
          {hasStats
            ? `${Number(visitorStats.total || 0).toLocaleString()} Visitors`
            : "Analytics not connected"}
        </span>
      </div>

      <div className="sd-extra-visitors-count">
        <strong>
          {hasStats
            ? Number(visitorStats.total || 0).toLocaleString()
            : "—"}
        </strong>

        {hasStats && visitorStats.change !== undefined && (
          <span>
            {visitorStats.change > 0 ? "+" : ""}
            {visitorStats.change}%
          </span>
        )}
      </div>

      <VisitorChart visitorSeries={visitorSeries} />
    </section>
  );
}

export default function DashboardExtras({
  orders = [],
  products = [],
  visitorStats = null,
  visitorSeries = [],
}) {
  return (
    <div className="sd-dashboard-extras">
      <RecentOrders orders={orders} />

      <div className="sd-extra-bottom-grid">
        <LatestProducts products={products} />

        <TotalVisitors
          visitorStats={visitorStats}
          visitorSeries={visitorSeries}
        />
      </div>

      <style>{`
        .sd-dashboard-extras {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
          font-family: "Segoe UI", Arial, sans-serif;
          color: #202124;
        }

        .sd-dashboard-extras * {
          box-sizing: border-box;
        }

        .sd-extra-card {
          min-width: 0;
          background: #ffffff;
          border: 1px solid #e5e5e5;
          border-radius: 13px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.025);
        }

        .sd-extra-heading {
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .sd-extra-heading h2 {
          margin: 0;
          font-size: 17px;
          font-weight: 650;
          color: #171717;
        }

        .sd-extra-heading button {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: #888888;
          font-size: 12px;
          cursor: not-allowed;
        }

        .sd-extra-muted {
          color: #858585;
          font-size: 12px;
        }

        .sd-extra-orders-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sd-extra-order {
          min-height: 87px;
          display: grid;
          grid-template-columns: minmax(210px, 2fr) minmax(110px, 1fr) 65px 110px minmax(130px, 1fr) 115px;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border: 1px solid #e6e6e6;
          border-radius: 13px;
        }

        .sd-extra-order-product {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .sd-extra-product-image {
          width: 58px;
          height: 58px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f8f7;
          border: 1px solid #ececec;
          border-radius: 13px;
          color: #a0a0a0;
          overflow: hidden;
        }

        .sd-extra-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sd-extra-order-product > div:last-child {
          min-width: 0;
        }

        .sd-extra-order-product strong {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 13px;
          font-weight: 600;
        }

        .sd-extra-order-product small {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          color: #888888;
        }

        .sd-extra-cell {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sd-extra-cell > small {
          font-size: 11px;
          color: #858585;
        }

        .sd-extra-cell > strong {
          font-size: 12px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .sd-extra-payment {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .sd-extra-payment svg {
          color: #777777;
          flex-shrink: 0;
        }

        .sd-extra-total {
          text-align: right;
        }

        .sd-extra-status {
          width: fit-content;
          padding: 5px 9px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
        }

        .sd-extra-status.delivered {
          background: #d8f5e8;
          color: #05714b;
        }

        .sd-extra-status.pending {
          background: #fff0d6;
          color: #a66a00;
        }

        .sd-extra-status.neutral {
          background: #f1f2f4;
          color: #667085;
        }

        .sd-extra-bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
          gap: 16px;
        }

        .sd-extra-bottom-card {
          min-height: 400px;
        }

        .sd-extra-products {
          display: flex;
          flex-direction: column;
        }

        .sd-extra-product-row {
          min-height: 70px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #eeeeee;
        }

        .sd-extra-product-row:last-child {
          border-bottom: none;
        }

        .sd-extra-product-row .sd-extra-product-image {
          width: 45px;
          height: 45px;
        }

        .sd-extra-product-row > strong {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sd-extra-product-row > span {
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 600;
        }

        .sd-extra-visitors-count {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin: 6px 0 10px;
        }

        .sd-extra-visitors-count strong {
          font-size: 27px;
          font-weight: 650;
          color: #171717;
        }

        .sd-extra-visitors-count span {
          color: var(--brand-primary);
          font-size: 12px;
        }

        .sd-extra-chart {
          position: relative;
          width: 100%;
        }

        .sd-extra-chart svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .sd-extra-chart-empty {
          position: absolute;
          top: 38%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #969696;
          font-size: 12px;
          text-align: center;
          width: 80%;
        }

        .sd-extra-chart-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          color: #858585;
          font-size: 11px;
        }

        .sd-extra-chart-legend span {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .sd-extra-chart-legend i {
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        .sd-extra-chart-legend .visitors {
          background: var(--brand-primary);
        }

        .sd-extra-chart-legend .pageviews {
          background: #999999;
        }

        .sd-extra-empty {
          min-height: 210px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          text-align: center;
        }

        .sd-extra-empty-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--brand-light);
          color: var(--brand-primary);
          border-radius: 50%;
        }

        .sd-extra-empty strong {
          font-size: 14px;
          font-weight: 600;
        }

        .sd-extra-empty p {
          margin: 0;
          color: #888888;
          font-size: 12px;
        }

        @media (max-width: 1250px) {
          .sd-extra-order {
            grid-template-columns: 1.5fr 1fr 65px 100px;
          }

          .sd-extra-order .sd-extra-payment,
          .sd-extra-order .sd-extra-total {
            display: none;
          }
        }

        @media (max-width: 900px) {
          .sd-extra-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .sd-extra-card {
            padding: 13px;
          }

          .sd-extra-heading h2 {
            font-size: 16px;
          }

          .sd-extra-order {
            grid-template-columns: 1fr 85px;
            gap: 12px;
          }

          .sd-extra-order .sd-extra-cell {
            display: none;
          }

          .sd-extra-order .sd-extra-total {
            display: flex;
          }

          .sd-extra-order .sd-extra-total strong {
            font-size: 12px;
          }

          .sd-extra-product-image {
            width: 47px;
            height: 47px;
          }

          .sd-extra-bottom-card {
            min-height: 330px;
          }
        }
      `}</style>
    </div>
  );
}
