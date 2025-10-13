import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReportData {
  month: string;
  totalJobs: number;
  totalApplications: number;
  accepted: number;
  rejected: number;
  pending: number;
  topCompanies: { company: string; jobs: number }[];
}

const AdminMonthlyReport: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch report data
  const fetchReport = async (m = month, y = year) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:3005/api/admin/monthly-report?month=${m}&year=${y}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(res.data as ReportData);
    } catch (err) {
      console.error("Error fetching monthly report:", err);
      setError("Failed to load monthly report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReport();
  }, [token]);

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Monthly_Report_${report?.month.replace(/\s/g, "_")}.pdf`);
  };

  if (loading) return <p className="p-3 text-muted">Loading report...</p>;
  if (error) return <p className="p-3 text-danger">{error}</p>;
  if (!report) return <p className="p-3 text-warning">No data available for selected month.</p>;

  return (
    <div className="container mt-5">
      {/* Header Section */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-primary mb-0">
          Monthly Jobs & Applicants Report — {report.month}
        </h2>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: "130px" }}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: "90px" }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />


          <button className="btn btn-sm btn-success" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>
      </div>

      {/* Report Body */}
      <div ref={reportRef}>
        {/* Summary Cards */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
          {[
            ["Jobs Posted", report.totalJobs],
            ["Applications", report.totalApplications],
            ["Accepted", report.accepted],
            ["Rejected", report.rejected],
            ["Pending", report.pending],
          ].map(([label, value]) => (
            <div
              key={label}
              className="card text-center border-0 shadow-sm"
              style={{ width: "140px", backgroundColor: "#f8f9fa" }}
            >
              <div className="card-body p-2">
                <h6 className="text-muted mb-1">{label}</h6>
                <p className="fw-bold fs-5 text-info mb-0">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Companies */}
        <h5 className="fw-bold mt-4">Top Hiring Companies</h5>
        <table className="table table-striped table-sm">
          <thead className="table-light">
            <tr>
              <th>Company</th>
              <th>Jobs</th>
            </tr>
          </thead>
          <tbody>
            {report.topCompanies.length > 0 ? (
              report.topCompanies.map((comp) => (
                <tr key={comp.company}>
                  <td>{comp.company}</td>
                  <td>{comp.jobs}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-muted">
                  No company data
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-4 text-center text-muted small">
          <p>Report generated from Admin Monthly Report API.</p>
          <p>© {new Date().getFullYear()} Job Board System</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMonthlyReport;
