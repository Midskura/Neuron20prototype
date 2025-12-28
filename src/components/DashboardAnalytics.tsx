import { 
  Package, Truck, CheckCircle, RotateCcw,
  Calendar, ChevronDown
} from "lucide-react";
import { useState } from "react";
import { TopBarMinimal } from "./TopBarMinimal";

interface DashboardAnalyticsProps {
  currentUser?: { name: string; email: string } | null;
}

export function DashboardAnalytics({ currentUser }: DashboardAnalyticsProps) {
  const [viewPeriod, setViewPeriod] = useState<"Week" | "Month" | "Year">("Year");
  const [chartView, setChartView] = useState<"Week" | "Month" | "Year">("Month");

  const statsChips = [
    { 
      label: "Total Shipments", 
      value: "18,250", 
      icon: Package, 
      iconBg: "rgba(35, 127, 102, 0.10)",
      iconColor: "#237F66"
    },
    { 
      label: "Active Shipments", 
      value: "880", 
      sublabel: "14% of total",
      icon: Truck, 
      iconBg: "rgba(35, 127, 102, 0.10)",
      iconColor: "#237F66"
    },
    { 
      label: "Completed", 
      value: "16,456", 
      sublabel: "81% of total",
      icon: CheckCircle, 
      iconBg: "rgba(35, 127, 102, 0.10)",
      iconColor: "#237F66"
    },
    { 
      label: "Returned", 
      value: "912", 
      sublabel: "5% of total",
      icon: RotateCcw, 
      iconBg: "rgba(176, 106, 79, 0.10)",
      iconColor: "#B06A4F",
      valueColor: "#B06A4F"
    },
  ];

  const shipmentData = [
    { month: "Mar", returned: 20, delivered: 80, onDelivery: 50 },
    { month: "Apr", returned: 15, delivered: 120, onDelivery: 65 },
    { month: "May", returned: 25, delivered: 100, onDelivery: 55 },
    { month: "Jun", returned: 18, delivered: 140, onDelivery: 70 },
    { month: "Jul", returned: 22, delivered: 110, onDelivery: 60 },
    { month: "Aug", returned: 12, delivered: 160, onDelivery: 80 },
    { month: "Sep", returned: 10, delivered: 150, onDelivery: 75 },
  ];

  const salesData = [
    { date: "Feb", amount: 3000 },
    { date: "Mar", amount: 4200 },
    { date: "Apr", amount: 5800 },
    { date: "May", amount: 4500 },
    { date: "Jun", amount: 6200 },
    { date: "Jul", amount: 5500 },
    { date: "Aug", amount: 7800 },
    { date: "Sep", amount: 8200 },
  ];

  const categories = [
    { name: "Appliances", percent: 45, color: "#1E6D59" },
    { name: "Accessories", percent: 16, color: "#8DBDAE" },
    { name: "Dishes", percent: 21, color: "#5BA9D6" },
    { name: "Kitchen textiles", percent: 14, color: "#3EACA8" },
    { name: "Food Materials", percent: 19, color: "#E5D4C1", border: "#CBBBAA" },
    { name: "Spices", percent: 3, color: "rgba(176, 106, 79, 0.8)" },
  ];

  const avgCheckData = [
    { category: "Appliances", value: 142.87 },
    { category: "Accessories", value: 190.50 },
    { category: "Food Materials", value: 87.30 },
    { category: "Dishes", value: 59.90 },
    { category: "Kitchen textiles", value: 41.20 },
    { category: "Spices", value: 41.20 },
  ];

  const deliveryTimeData = [
    { region: "NCR", perfectly: 60, fine: 30, tooLong: 10, avgDays: "2 days" },
    { region: "CALABARZON", perfectly: 40, fine: 40, tooLong: 20, avgDays: "8 days" },
    { region: "Central Visayas", perfectly: 50, fine: 30, tooLong: 20, avgDays: "12 days" },
    { region: "Davao Region", perfectly: 35, fine: 45, tooLong: 20, avgDays: "5 days" },
    { region: "Northern Mindanao", perfectly: 70, fine: 20, tooLong: 10, avgDays: "2 days" },
  ];

  const maxShipment = 250;
  const maxSales = 10000;
  const avgSales = salesData.reduce((sum, d) => sum + d.amount, 0) / salesData.length;
  const maxCheck = Math.max(...avgCheckData.map(d => d.value));

  // Card base style
  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E5E9F0",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7F6" }}>
      {/* Top Bar */}
      <TopBarMinimal 
        title="Analytics Dashboard"
        currentUser={currentUser}
      />

      {/* Content Area - Module Container */}
      <div style={{
        padding: "24px",
        maxWidth: "1440px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
      }}>
        {/* Top Controls */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between"
        }}>
          {/* Date Range */}
          <button style={{
            padding: "8px 12px",
            background: "#FFFFFF",
            border: "1px solid #E5E9F0",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#667085",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <Calendar size={14} />
            Jan 01, 2023 - Sep 20, 2023
            <ChevronDown size={14} />
          </button>

          {/* View Period Segmented Control */}
          <div style={{
            height: "32px",
            background: "#F7FAF8",
            borderRadius: "999px",
            padding: "2px",
            display: "flex",
            gap: "2px",
            border: "1px solid #E5E9F0"
          }}>
            {(["Week", "Month", "Year"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setViewPeriod(period)}
                style={{
                  padding: "0 16px",
                  height: "28px",
                  background: viewPeriod === period ? "#E8F2EE" : "transparent",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: viewPeriod === period ? "#12332B" : "#667085",
                  cursor: "pointer",
                  transition: "all 120ms ease-out"
                }}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Chips Row - 4 Tiles Evenly Spaced */}
        <div style={{ 
          display: "flex",
          gap: "24px",
          alignItems: "center"
        }}>
          {statsChips.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                style={{
                  ...cardStyle,
                  flex: 1,
                  height: "140px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "999px",
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Icon size={16} style={{ color: stat.iconColor }} />
                </div>
                <div style={{ 
                  fontSize: "12px", 
                  color: "#667085",
                  lineHeight: "16px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {stat.label}
                </div>
                <div style={{ 
                  fontSize: "32px", 
                  fontWeight: 600, 
                  color: stat.valueColor || "#12332B",
                  lineHeight: "120%",
                  fontVariantNumeric: "tabular-nums"
                }}>
                  {stat.value}
                </div>
                {stat.sublabel && (
                  <div style={{ 
                    fontSize: "12px", 
                    color: "#667085", 
                    marginTop: "auto",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {stat.sublabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Charts Row - Shipment and Expanded Sales */}
        <div style={{ 
          display: "flex",
          gap: "24px",
          alignItems: "flex-start"
        }}>
          {/* Shipment Chart (Stacked Columns) */}
          <div style={{
            ...cardStyle,
            width: "52%",
            height: "360px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", margin: 0 }}>
                Shipment
              </h3>
              
              {/* Chart View Toggle */}
              <div style={{
                height: "32px",
                background: "#F7FAF8",
                borderRadius: "999px",
                padding: "2px",
                display: "flex",
                gap: "2px",
                border: "1px solid #E5E9F0"
              }}>
                {(["Week", "Month", "Year"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartView(period)}
                    style={{
                      padding: "0 12px",
                      height: "28px",
                      background: chartView === period ? "#E8F2EE" : "transparent",
                      border: "none",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: chartView === period ? "#12332B" : "#667085",
                      cursor: "pointer"
                    }}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Stacked Column Chart */}
            <div style={{ flex: 1, position: "relative", minHeight: 0, padding: "16px 16px 16px 24px" }}>
              <svg width="100%" height="100%" viewBox="0 0 700 240" preserveAspectRatio="xMidYMid meet">
                {/* Y-axis grid lines and labels */}
                {[0, 50, 100, 150, 200, 250].map((y) => (
                  <g key={y}>
                    <line
                      x1="50"
                      y1={220 - (y / maxShipment * 200)}
                      x2="700"
                      y2={220 - (y / maxShipment * 200)}
                      stroke="#EEF2F6"
                      strokeWidth="1"
                    />
                    <text
                      x="40"
                      y={220 - (y / maxShipment * 200) + 4}
                      fontSize="12"
                      fill="#667085"
                      textAnchor="end"
                      fontFamily="Inter"
                    >
                      {y}
                    </text>
                  </g>
                ))}

                {/* Stacked Bars */}
                {shipmentData.map((item, idx) => {
                  const x = 80 + idx * 85;
                  const barWidth = 56;
                  
                  const returnedHeight = (item.returned / maxShipment) * 200;
                  const deliveredHeight = (item.delivered / maxShipment) * 200;
                  const onDeliveryHeight = (item.onDelivery / maxShipment) * 200;
                  
                  return (
                    <g key={idx}>
                      {/* Returned (bottom) */}
                      <rect
                        x={x}
                        y={220 - returnedHeight}
                        width={barWidth}
                        height={returnedHeight}
                        fill="#F1E4DF"
                        stroke="rgba(176, 106, 79, 0.2)"
                        strokeWidth="1"
                        rx="4"
                      />
                      
                      {/* Delivered (middle) */}
                      <rect
                        x={x}
                        y={220 - returnedHeight - deliveredHeight}
                        width={barWidth}
                        height={deliveredHeight}
                        fill="#8DBDAE"
                        rx="4"
                      />
                      
                      {/* On Delivery (top) */}
                      <rect
                        x={x}
                        y={220 - returnedHeight - deliveredHeight - onDeliveryHeight}
                        width={barWidth}
                        height={onDeliveryHeight}
                        fill="#1E6D59"
                        rx="4"
                      />

                      {/* X-axis label */}
                      <text
                        x={x + barWidth / 2}
                        y={235}
                        fontSize="12"
                        fill="#667085"
                        textAnchor="middle"
                        fontFamily="Inter"
                      >
                        {item.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "20px", paddingLeft: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: "#F1E4DF", borderRadius: "50%", border: "1px solid rgba(176, 106, 79, 0.2)" }} />
                <span style={{ fontSize: "12px", color: "#667085" }}>Returned</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: "#8DBDAE", borderRadius: "50%" }} />
                <span style={{ fontSize: "12px", color: "#667085" }}>Delivered</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: "#1E6D59", borderRadius: "50%" }} />
                <span style={{ fontSize: "12px", color: "#667085" }}>On Delivery</span>
              </div>
            </div>
          </div>

          {/* Sales Chart (Expanded - Line with Area) */}
          <div style={{
            ...cardStyle,
            width: "48%",
            height: "400px",
            padding: "24px 36px 28px 36px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", margin: 0 }}>
                Sales
              </h3>
              
              {/* Legend - Top Right */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "8px", height: "8px", background: "#1E6D59", borderRadius: "50%" }} />
                <span style={{ fontSize: "12px", color: "#667085" }}>Revenue</span>
              </div>
            </div>

            {/* Line Chart */}
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 480 300" preserveAspectRatio="xMidYMid meet">
                {/* Y-axis grid and labels */}
                {[0, 2500, 5000, 7500, 10000].map((val, idx) => {
                  const y = 270 - (val / maxSales * 240);
                  return (
                    <g key={idx}>
                      <line
                        x1="55"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="#EEF2F6"
                        strokeWidth="1"
                      />
                      <text
                        x="50"
                        y={y + 4}
                        fontSize="12"
                        fill="#667085"
                        textAnchor="end"
                        fontFamily="Inter"
                      >
                        {val === 0 ? '₱0' : `₱${val / 1000}k`}
                      </text>
                    </g>
                  );
                })}

                {/* Average baseline (dashed) */}
                <line
                  x1="55"
                  y1={270 - (avgSales / maxSales * 240)}
                  x2="480"
                  y2={270 - (avgSales / maxSales * 240)}
                  stroke="#DDE7E3"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />

                {/* Area fill */}
                <path
                  d={`M 55 ${270 - (salesData[0].amount / maxSales * 240)} ${salesData.map((item, idx) => {
                    const x = 55 + (idx / (salesData.length - 1)) * 425;
                    const y = 270 - (item.amount / maxSales * 240);
                    return `L ${x} ${y}`;
                  }).join(' ')} L 480 270 L 55 270 Z`}
                  fill="rgba(30, 109, 89, 0.15)"
                />

                {/* Line path */}
                <path
                  d={salesData.map((item, idx) => {
                    const x = 55 + (idx / (salesData.length - 1)) * 425;
                    const y = 270 - (item.amount / maxSales * 240);
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#1E6D59"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {salesData.map((item, idx) => {
                  const x = 55 + (idx / (salesData.length - 1)) * 425;
                  const y = 270 - (item.amount / maxSales * 240);
                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#FFFFFF"
                        stroke="#1E6D59"
                        strokeWidth="2"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="#1E6D59"
                      />
                    </g>
                  );
                })}

                {/* X-axis labels */}
                {salesData.map((item, idx) => {
                  const x = 55 + (idx / (salesData.length - 1)) * 425;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={288}
                      fontSize="12"
                      fill="#667085"
                      textAnchor="middle"
                      fontFamily="Inter"
                    >
                      {item.date}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Row - 3 Cards */}
        <div style={{ 
          display: "flex",
          gap: "24px"
        }}>
          {/* Popular Categories (Donut) */}
          <div style={{
            ...cardStyle,
            flex: 1,
            minHeight: "200px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", margin: 0 }}>
                Popular Categories
              </h3>
              <button style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#667085",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}>
                See All →
              </button>
            </div>

            <div style={{ display: "flex", gap: "20px", alignItems: "center", flex: 1, padding: "12px" }}>
              {/* Donut Chart */}
              <div style={{ width: "140px", height: "140px", flexShrink: 0 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {(() => {
                    let currentAngle = -90;
                    return categories.map((cat, idx) => {
                      const radius = 60;
                      const innerRadius = 38;
                      const startAngle = currentAngle;
                      const angle = (cat.percent / 100) * 360;
                      currentAngle += angle;
                      
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = ((startAngle + angle) * Math.PI) / 180;
                      
                      const x1 = 70 + radius * Math.cos(startRad);
                      const y1 = 70 + radius * Math.sin(startRad);
                      const x2 = 70 + radius * Math.cos(endRad);
                      const y2 = 70 + radius * Math.sin(endRad);
                      
                      const x3 = 70 + innerRadius * Math.cos(endRad);
                      const y3 = 70 + innerRadius * Math.sin(endRad);
                      const x4 = 70 + innerRadius * Math.cos(startRad);
                      const y4 = 70 + innerRadius * Math.sin(startRad);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={idx}
                          d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                          fill={cat.color}
                          stroke={cat.border || "none"}
                          strokeWidth={cat.border ? "1" : "0"}
                        />
                      );
                    });
                  })()}
                </svg>
              </div>

              {/* Legend */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                {categories.map((cat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ 
                      width: "8px", 
                      height: "8px", 
                      borderRadius: "50%",
                      background: cat.color,
                      border: cat.border ? `1px solid ${cat.border}` : "none",
                      flexShrink: 0
                    }} />
                    <span style={{ 
                      fontSize: "12px", 
                      color: "#667085", 
                      flex: 1, 
                      whiteSpace: "nowrap", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis" 
                    }}>
                      {cat.name}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#12332B" }}>
                      {cat.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Average Check */}
          <div style={{
            ...cardStyle,
            flex: 1,
            minHeight: "200px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", margin: 0 }}>
                Av. Check (₱)
              </h3>
              <button style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#667085",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}>
                See All →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", flex: 1 }}>
              {avgCheckData.map((item, idx) => (
                <div key={idx}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    marginBottom: "6px"
                  }}>
                    <span style={{ 
                      fontSize: "12px", 
                      color: "#667085",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      paddingRight: "8px"
                    }}>
                      {item.category}
                    </span>
                    <span style={{ 
                      fontSize: "14px", 
                      fontWeight: 600, 
                      color: "#12332B",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0
                    }}>
                      ₱{item.value.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ 
                    height: "6px", 
                    background: "#EEF2F6",
                    borderRadius: "3px",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${(item.value / maxCheck) * 100}%`,
                      background: `linear-gradient(90deg, #8DBDAE 0%, #1E6D59 100%)`,
                      borderRadius: "3px"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Average Delivery Time */}
          <div style={{
            ...cardStyle,
            flex: 1,
            minHeight: "200px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#12332B", margin: 0 }}>
                Av. Delivery Time
              </h3>
              <button style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#667085",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}>
                See All →
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              {deliveryTimeData.map((item, idx) => {
                const total = item.perfectly + item.fine + item.tooLong;
                return (
                  <div key={idx}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      marginBottom: "6px"
                    }}>
                      <span style={{ 
                        fontSize: "12px", 
                        color: "#667085",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        paddingRight: "8px"
                      }}>
                        {item.region}
                      </span>
                      <span style={{ 
                        fontSize: "14px", 
                        fontWeight: 600, 
                        color: "#12332B",
                        flexShrink: 0
                      }}>
                        {item.avgDays}
                      </span>
                    </div>
                    <div style={{ 
                      height: "20px", 
                      display: "flex",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#EEF2F6"
                    }}>
                      {item.perfectly > 0 && (
                        <div 
                          style={{
                            width: `${(item.perfectly / total) * 100}%`,
                            background: "#8DBDAE"
                          }}
                        />
                      )}
                      {item.fine > 0 && (
                        <div 
                          style={{
                            width: `${(item.fine / total) * 100}%`,
                            background: "#5BA9D6"
                          }}
                        />
                      )}
                      {item.tooLong > 0 && (
                        <div 
                          style={{
                            width: `${(item.tooLong / total) * 100}%`,
                            background: "#B06A4F"
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ 
              display: "flex", 
              gap: "16px", 
              justifyContent: "center",
              paddingTop: "12px",
              borderTop: "1px solid #EEF2F6"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%",
                  background: "#8DBDAE"
                }} />
                <span style={{ fontSize: "11px", color: "#667085" }}>
                  Perfectly
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%",
                  background: "#5BA9D6"
                }} />
                <span style={{ fontSize: "11px", color: "#667085" }}>
                  Fine
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%",
                  background: "#B06A4F"
                }} />
                <span style={{ fontSize: "11px", color: "#667085" }}>
                  For too long
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div style={{ 
          textAlign: "right",
          fontSize: "11px",
          fontWeight: 500,
          color: "#94A3B8"
        }}>
          Powered by Neuron
        </div>
      </div>
    </div>
  );
}
