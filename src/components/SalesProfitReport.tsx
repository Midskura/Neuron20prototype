import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import exampleImage from "figma:asset/1fce3c5f7d32bb6892cac76678086b04e31764a4.png";

interface ReportEntry {
  id: string;
  jobNo: string;
  date: string;
  companyName: string;
  billingNo: string;
  particulars: string;
  itemizedCost: number;
  expenses: number;
  adminCost: number;
  totalExpenses: number;
  collectedAmount: number;
  grossProfit: number;
}

interface SalesProfitReportProps {
  entries: ReportEntry[];
  month: string;
  year: string;
  companyName?: string;
}

export function SalesProfitReport({ entries, month, year, companyName = "" }: SalesProfitReportProps) {
  const [commission, setCommission] = useState(0);

  // Calculate totals
  const totals = entries.reduce(
    (acc, entry) => ({
      itemizedCost: acc.itemizedCost + entry.itemizedCost,
      expenses: acc.expenses + entry.expenses,
      adminCost: acc.adminCost + entry.adminCost,
      totalExpenses: acc.totalExpenses + entry.totalExpenses,
      collectedAmount: acc.collectedAmount + entry.collectedAmount,
      grossProfit: acc.grossProfit + entry.grossProfit,
    }),
    {
      itemizedCost: 0,
      expenses: 0,
      adminCost: 0,
      totalExpenses: 0,
      collectedAmount: 0,
      grossProfit: 0,
    }
  );

  const totalProfit = totals.grossProfit;
  const profitAfterCommission = totalProfit - commission;
  const staffCommission = profitAfterCommission * 0.1;
  const totalGrossProfit = profitAfterCommission - staffCommission;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      {/* Report Container with Excel styling */}
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "40px",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          {companyName && (
            <div
              className="uppercase mb-3"
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#000000",
                letterSpacing: "0.5px",
              }}
            >
              {companyName}
            </div>
          )}
          <div
            className="uppercase mb-2"
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#000000",
              letterSpacing: "1px",
            }}
          >
            SALES REPORT
          </div>
          <div
            className="uppercase"
            style={{
              fontSize: "10px",
              fontWeight: "normal",
              color: "#000000",
              letterSpacing: "0.5px",
            }}
          >
            AS OF {month.toUpperCase()} {year}
          </div>
        </div>

        {/* Main Content - Vertical Layout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* 1. Main Table - Full Width */}
          <div style={{ paddingBottom: "16px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "9px",
                border: "1px solid #000",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#0F766E", color: "#FFFFFF", height: "32px" }}>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                      color: "#FFFFFF",
                    }}
                  >
                    JOB NO. / DATE
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                      color: "#FFFFFF",
                    }}
                  >
                    COMPANY NAME
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                      color: "#FFFFFF",
                    }}
                  >
                    BILLING NO.
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                      color: "#FFFFFF",
                    }}
                  >
                    PARTICULARS
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: 600,
                      fontSize: "8px",
                      textAlign: "center",
                      backgroundColor: "#FFE5E5",
                      color: "#000000",
                    }}
                  >
                    ITEMIZED COST
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: 600,
                      fontSize: "8px",
                      textAlign: "center",
                      backgroundColor: "#FFE5E5",
                      color: "#000000",
                    }}
                  >
                    EXPENSES
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: 600,
                      fontSize: "8px",
                      textAlign: "center",
                      backgroundColor: "#FFE5E5",
                      color: "#000000",
                    }}
                  >
                    ADMIN COST 3%
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: 600,
                      fontSize: "8px",
                      textAlign: "center",
                      backgroundColor: "#FFE5E5",
                      color: "#000000",
                    }}
                  >
                    TOTAL EXPENSES
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: 600,
                      fontSize: "8px",
                      textAlign: "center",
                      backgroundColor: "#E3F2F7",
                      color: "#000000",
                    }}
                  >
                    COLLECTED AMOUNT
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      fontWeight: 600,
                      fontSize: "8px",
                      textAlign: "center",
                      backgroundColor: "#E8F5E9",
                      color: "#000000",
                    }}
                  >
                    GROSS PROFIT
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={entry.id} style={{ height: "24px" }}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.jobNo}
                      <br />
                      <span style={{ fontSize: "7px", color: "#666" }}>{entry.date}</span>
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                      }}
                    >
                      {entry.companyName}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                      }}
                    >
                      {entry.billingNo}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                      }}
                    >
                      {entry.particulars}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        textAlign: "right",
                        backgroundColor: "#FFE5E5",
                        color: "#2A2A2A",
                      }}
                    >
                      ₱{entry.itemizedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        textAlign: "right",
                        backgroundColor: "#FFE5E5",
                        color: "#2A2A2A",
                      }}
                    >
                      ₱{entry.expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        textAlign: "right",
                        backgroundColor: "#FFE5E5",
                        color: "#2A2A2A",
                      }}
                    >
                      ₱{entry.adminCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        textAlign: "right",
                        backgroundColor: "#FFE5E5",
                        color: "#2A2A2A",
                        fontWeight: "bold",
                      }}
                    >
                      ₱{entry.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        textAlign: "right",
                        backgroundColor: "#E3F2F7",
                        color: "#1F2937",
                      }}
                    >
                      ₱{entry.collectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "3px 6px",
                        fontSize: "8px",
                        textAlign: "right",
                        backgroundColor: "#E8F5E9",
                        color: "#1F2937",
                        fontWeight: "bold",
                      }}
                    >
                      ₱{entry.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {/* TOTAL ROW */}
                <tr style={{ height: "28px", backgroundColor: "#F3F4F6" }}>
                  <td
                    colSpan={4}
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#FFE5E5",
                      color: "#2A2A2A",
                    }}
                  >
                    ₱{totals.itemizedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#FFE5E5",
                      color: "#2A2A2A",
                    }}
                  >
                    ₱{totals.expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#FFE5E5",
                      color: "#2A2A2A",
                    }}
                  >
                    ₱{totals.adminCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#FFE5E5",
                      color: "#2A2A2A",
                    }}
                  >
                    ₱{totals.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#E3F2F7",
                      color: "#1F2937",
                    }}
                  >
                    ₱{totals.collectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 6px",
                      fontSize: "9px",
                      textAlign: "right",
                      fontWeight: "bold",
                      backgroundColor: "#E8F5E9",
                      color: "#1F2937",
                    }}
                  >
                    ₱{totals.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Summary Section */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "12px",
              }}
            >
              Summary for {month} {year}
            </div>
            <div
              style={{
                border: "2px solid #000",
                padding: "16px",
                fontSize: "9px",
                maxWidth: "440px",
              }}
            >
              {/* Profit */}
              <div className="flex justify-between mb-2">
                <span>PROFIT:</span>
                <span style={{ fontWeight: "bold" }}>
                  ₱{totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Less Commission */}
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: "8px" }}>LESS: COMMISSION (CO.CAMILLE):</span>
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  style={{
                    width: "100px",
                    border: "1px solid #999",
                    padding: "3px 6px",
                    fontSize: "8px",
                    textAlign: "right",
                    fontFamily: "Arial, sans-serif",
                  }}
                />
              </div>

              <div
                style={{
                  borderTop: "1px solid #999",
                  marginTop: "12px",
                  paddingTop: "12px",
                }}
              >
                {/* Total Profit */}
                <div className="flex justify-between mb-2">
                  <span>TOTAL PROFIT:</span>
                  <span style={{ fontWeight: "bold" }}>
                    ₱{profitAfterCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Less 10% Commission */}
                <div className="flex justify-between mb-2">
                  <span style={{ fontSize: "8px" }}>LESS: 10% COMMISSION FOR STAFF:</span>
                  <span style={{ fontWeight: "bold", fontSize: "8px" }}>
                    ₱{staffCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Total Gross Profit */}
                <div
                  className="flex justify-between"
                  style={{
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "2px solid #000",
                    backgroundColor: "#D4EDDA",
                    padding: "8px",
                    marginLeft: "-16px",
                    marginRight: "-16px",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>TOTAL GROSS PROFIT:</span>
                  <span style={{ fontWeight: "bold" }}>
                    ₱{totalGrossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Totals Row (3-Up) */}
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "normal",
                color: "#6B7280",
                marginBottom: "8px",
              }}
            >
              Totals (for this period)
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #999",
                  padding: "12px",
                  backgroundColor: "#FCE5E5",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#000000",
                  fontSize: "10px",
                  minHeight: "52px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "8px", marginBottom: "4px" }}>TOTAL EXPENSES</div>
                <div>₱{totals.totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #999",
                  padding: "12px",
                  backgroundColor: "#DAEEF3",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#000000",
                  fontSize: "10px",
                  minHeight: "52px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "8px", marginBottom: "4px" }}>COLLECTED AMOUNT</div>
                <div>₱{totals.collectedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
              <div
                style={{
                  flex: 1,
                  border: "1px solid #999",
                  padding: "12px",
                  backgroundColor: "#E8F5E9",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#000000",
                  fontSize: "10px",
                  minHeight: "52px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: "8px", marginBottom: "4px" }}>GROSS PROFIT</div>
                <div>₱{totals.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div style={{ marginTop: "32px", paddingBottom: "32px" }}>
          {/* NOTE Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: "#000000", marginBottom: "8px" }}>
              NOTE:
            </div>
            <div style={{ fontSize: "8px", color: "#1F2937", lineHeight: "1.5" }}>
              CRT = Crating • MOB = Mobilization • PLT = Palletizing • OC = Ocean Charges • PCKS = Packing Supplies
            </div>
          </div>

          {/* Signatory Section */}
          <div style={{ marginBottom: "20px" }}>
            <div className="grid grid-cols-3 gap-8" style={{ fontSize: "9px" }}>
              {/* Prepared By */}
              <div>
                <div style={{ marginBottom: "4px", fontWeight: "bold", color: "#000000" }}>Prepared By:</div>
                <div style={{ borderBottom: "1px solid #000", minHeight: "20px", marginBottom: "2px" }}>
                  <span style={{ fontSize: "8px" }}>Admin Staff</span>
                </div>
                <div style={{ borderBottom: "1px solid #000", minHeight: "16px", marginBottom: "2px" }}></div>
                <div style={{ fontSize: "7px", color: "#666", textAlign: "center" }}>Name / Signature</div>
              </div>

              {/* Reviewed By */}
              <div>
                <div style={{ marginBottom: "4px", fontWeight: "bold", color: "#000000" }}>Reviewed By:</div>
                <div style={{ borderBottom: "1px solid #000", minHeight: "20px", marginBottom: "2px" }}></div>
                <div style={{ borderBottom: "1px solid #000", minHeight: "16px", marginBottom: "2px" }}></div>
                <div style={{ fontSize: "7px", color: "#666", textAlign: "center" }}>Name / Signature</div>
              </div>

              {/* Approved By */}
              <div>
                <div style={{ marginBottom: "4px", fontWeight: "bold", color: "#000000" }}>Approved By:</div>
                <div style={{ borderBottom: "1px solid #000", minHeight: "20px", marginBottom: "2px" }}></div>
                <div style={{ borderBottom: "1px solid #000", minHeight: "16px", marginBottom: "2px" }}></div>
                <div style={{ fontSize: "7px", color: "#666", textAlign: "center" }}>Name / Signature</div>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div style={{ 
            fontSize: "8px", 
            color: "#6B7280", 
            textAlign: "center",
            paddingTop: "16px",
            borderTop: "1px solid #E5E7EB"
          }}>
            Period: {month} {year} • Company: {companyName || "All Companies"} • {entries.length} bookings
          </div>
        </div>
      </div>
    </div>
  );
}