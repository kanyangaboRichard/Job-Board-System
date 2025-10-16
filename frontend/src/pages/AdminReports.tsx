import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import AsyncSelect from "react-select/async";
import type { CSSObjectWithLabel, GroupBase, OptionProps } from "react-select";

// Interfaces
interface ApplicationDetail {
  company: string;
  applicant_name: string;
  job_title: string;
  status: "accepted" | "rejected" | "pending";
  applied_at: string;
}

interface ReportData {
  period: string;
  totalJobs: number;
  totalApplications: number;
  accepted: number;
  rejected: number;
  pending: number;
  applications: ApplicationDetail[];
}

interface CompaniesResponse {
  companies?: string[];
  name?: string;
  company?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const AdminReport: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);
  const [company, setCompany] = useState("");

  const reportRef = useRef<HTMLDivElement>(null);

  //  Fetch report data
  const fetchReport = async (): Promise<void> => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const query = new URLSearchParams({ startDate, endDate });
      if (company.trim()) query.append("company", company.trim());

      const res = await axios.get<ReportData>(
        `http://localhost:3005/api/admin/monthly-report-range?${query.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReport(res.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError("Failed to load report for selected period/company.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh report when date or company changes (debounced)
  useEffect(() => {
    if (!token) return;
    const debounceTimer = setTimeout(() => {
      fetchReport();
    }, 500);
    return () => clearTimeout(debounceTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, company, token]);

  //  Load companies dynamically for search dropdown
  const loadCompanyOptions = async (inputValue: string): Promise<SelectOption[]> => {
    if (!token) return [];

    try {
      const res = await axios.get<string[] | CompaniesResponse[]>(
        `http://localhost:3005/api/admin/companies?search=${inputValue}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      let list: string[] = [];

      if (Array.isArray(data)) {
        list = data.map((c: string | CompaniesResponse) =>
          typeof c === "string" ? c : c.company ?? c.name ?? ""
        );
      } else if (Array.isArray((data as CompaniesResponse)?.companies)) {
        list = (data as CompaniesResponse).companies || [];
      }

      return list
        .filter((name) => name && name.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 5)
        .map((name) => ({ value: name, label: name }));
    } catch (err) {
      console.error("Error fetching company options:", err);
      return [];
    }
  };

  //  Generate PDF
  const handleDownloadPDF = async (): Promise<void> => {
    if (!reportRef.current) return;
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const safePeriod =
      report?.period?.replace(/\s/g, "_") || `${startDate}_to_${endDate}`;
    pdf.save(`Report_${company || "All"}_${safePeriod}.pdf`);
  };

  // Generate CSV
  const handleDownloadCSV = (): void => {
    if (!report) return;

    // CSV header
    const headers = [
      "Company",
      "Applicant",
      "Job Title",
      "Status",
      "Applied On",
    ];

    // CSV rows
    const rows = report.applications.map((app) => [
      app.company,
      app.applicant_name,
      app.job_title,
      app.status,
      new Date(app.applied_at).toLocaleDateString(),
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((v) => `"${v ?? ""}"`).join(","))
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const safePeriod =
      report?.period?.replace(/\s/g, "_") || `${startDate}_to_${endDate}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Report_${company || "All"}_${safePeriod}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mt-5">
      {/* Header & Filters */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary mb-0">
          Admin Report {report?.period && `— ${report.period}`}
        </h2>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Start Date */}
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: "180px" }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <span className="mx-1">to</span>

          {/* End Date */}
          <input
            type="date"
            className="form-control form-control-sm"
            style={{ width: "180px" }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          {/* Async Company Dropdown */}
          <div style={{ width: "250px" }}>
            <AsyncSelect<SelectOption, false, GroupBase<SelectOption>>
              cacheOptions
              defaultOptions={[{ value: "", label: "All Companies" }]}
              loadOptions={loadCompanyOptions}
              isClearable
              isSearchable
              value={
                company
                  ? { value: company, label: company }
                  : { value: "", label: "All Companies" }
              }
              onChange={(selected) => setCompany(selected ? selected.value : "")}
              placeholder="Search or select a company..."
              styles={{
                control: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
                  ...base,
                  minHeight: "32px",
                  fontSize: "0.9rem",
                  borderColor: "#ced4da",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#86b7fe" },
                }),
                option: (
                  base: CSSObjectWithLabel,
                  state: OptionProps<SelectOption, false, GroupBase<SelectOption>>
                ): CSSObjectWithLabel => ({
                  ...base,
                  fontSize: "0.9rem",
                  backgroundColor: state.isSelected
                    ? "#0d6efd"
                    : state.isFocused
                    ? "#e9ecef"
                    : "white",
                  color: state.isSelected ? "white" : "black",
                }),
              }}
            />
          </div>

          <button className="btn btn-sm btn-primary" onClick={fetchReport}>
            Refresh
          </button>

          {report && (
            <>
              <button className="btn btn-sm btn-success" onClick={handleDownloadPDF}>
                Download PDF
              </button>
              <button className="btn btn-sm btn-outline-success" onClick={handleDownloadCSV}>
                Download CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Body */}
      <div ref={reportRef}>
        {loading && <p className="text-muted">Loading report...</p>}
        {error && <p className="text-danger">{error}</p>}

        {!loading && !error && report && (
          <>
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
                    <p className="fw-bold fs-5 text-info mb-0">{value as number}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Applications Table */}
            <h5 className="fw-bold mt-4">
              {company ? `Applications for ${company}` : "All Company Applications"}
            </h5>

            <table className="table table-striped table-sm">
              <thead className="table-light">
                <tr>
                  <th>Company</th>
                  <th>Applicant</th>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {report.applications?.length > 0 ? (
                  report.applications.map((app, index) => (
                    <tr key={index}>
                      <td>{app.company}</td>
                      <td>{app.applicant_name}</td>
                      <td>{app.job_title}</td>
                      <td
                        className={
                          app.status === "accepted"
                            ? "text-success fw-bold"
                            : app.status === "rejected"
                            ? "text-danger fw-bold"
                            : "text-warning fw-bold"
                        }
                      >
                        {app.status}
                      </td>
                      <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No applications found for {company || "this period"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-4 text-center text-muted small">
              <p>
                Report generated for {company || "all companies"} ({startDate} →{" "}
                {endDate})
              </p>
              <p>© {new Date().getFullYear()} Job Board System</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReport;
