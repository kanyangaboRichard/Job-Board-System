import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ReportData {
  month: string;
  totalJobs: number;
  totalApplications: number;
  accepted: number;
  rejected: number;
  pending: number;
  topCompanies: { company: string; jobs: number; applications: number; accepted: number }[];
  jobCategories: { category: string; jobs: number; applications: number }[];
}

const MonthlyReport: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null); // For PDF export

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get<ReportData>("http://localhost:3005/api/admin/monthly-report", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [token]);

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

  if (loading) return <p className="p-3 text-muted">Loading monthly report...</p>;
  if (error) return <p className="p-3 text-danger">{error}</p>;
  if (!report) return <p className="p-3 text-warning">No report data found.</p>;

  return (
    <div className="container mt-5">
      {/* Header and Download Button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary fw-bold mb-0">
          Monthly Jobs & Applicants Report — {report.month}
        </h2>
        <button className="btn btn-outline-success btn-sm" onClick={handleDownloadPDF}>
           Download PDF
        </button>
      </div>

      {/* Content to export */}
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

        {/* Job Categories Table */}
        <h5 className="fw-bold mt-4">Job Categories Overview</h5>
        <table className="table table-striped table-sm">
          <thead className="table-light">
            <tr>
              <th>Category</th>
              <th>Jobs</th>
              <th>Applications</th>
            </tr>
          </thead>
          <tbody>
            {report.jobCategories.map((cat) => (
              <tr key={cat.category}>
                <td>{cat.category}</td>
                <td>{cat.jobs}</td>
                <td>{cat.applications}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Top Companies */}
        <h5 className="fw-bold mt-4">Top Hiring Companies</h5>
        <table className="table table-striped table-sm">
          <thead className="table-light">
            <tr>
              <th>Company</th>
              <th>Jobs</th>
              <th>Applications</th>
              <th>Accepted</th>
            </tr>
          </thead>
          <tbody>
            {report.topCompanies.map((comp) => (
              <tr key={comp.company}>
                <td>{comp.company}</td>
                <td>{comp.jobs}</td>
                <td>{comp.applications}</td>
                <td>{comp.accepted}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-4 text-center text-muted small">
          <p>Report generated automatically from Admin Statistics API.</p>
          <p>© {new Date().getFullYear()} Job Board System</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
