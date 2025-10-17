import React, { useEffect, useState, useMemo } from "react";
import ApplicationCard from "../components/ApplicationCard";
import {
  getApplications,
  respondToApplication,
  type Application,
} from "../api/applications";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import Select from "react-select";

type Option = {
  value: number | string;
  label: string;
};

const ApplicationPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Option | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal for full cover letter
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");

  // React-select control
  const [inputValue, setInputValue] = useState<string>("");
  const [displayedOptions, setDisplayedOptions] = useState<Option[]>([]);

  // Get token from Redux
  const token = useSelector((state: RootState) => state.auth.token);

  // Fetch applications on mount or when token changes
  useEffect(() => {
    if (!token) return;

    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        setError("Could not load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  // Handle Accept/Reject actions
  const handleRespond = async (
    id: number | string,
    status: "accepted" | "rejected",
    responseNote?: string
  ) => {
    try {
      const updated = await respondToApplication(id, status, responseNote);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? {
                ...app,
                status: updated.status,
                responseNote: updated.responseNote,
              }
            : app
        )
      );
    } catch (err) {
      console.error("Failed to update application:", err);
      alert("Failed to update application. Please try again.");
    }
  };

  //  Memoize options to prevent infinite re-renders
  const options: Option[] = useMemo(() => {
    return applications
      .map((app) => ({
        value: app.id,
        label: `${app.applicantName} — ${app.applicantEmail}`,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
      );
  }, [applications]);

  // Compute top 5 matches (runs only when options or input changes)
  useEffect(() => {
    const q = inputValue.trim().toLowerCase();
    const matches = q
      ? options.filter((o) => o.label.toLowerCase().includes(q))
      : options;
    setDisplayedOptions(matches.slice(0, 5));
  }, [options, inputValue]);

  // Filter applications by selected applicant
  const filteredApplications = useMemo(() => {
    const list = selectedApplicant
      ? applications.filter((app) => app.id === selectedApplicant.value)
      : applications;

    return [...list].sort((a, b) =>
      (a.applicantName ?? "").localeCompare(b.applicantName ?? "", undefined, {
        sensitivity: "base",
      })
    );
  }, [applications, selectedApplicant]);

  //  Modal handlers
  const openModal = (fullText: string) => {
    setModalContent(fullText);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent("");
  };

  //  UI RENDER
  if (loading) return <p className="p-4 text-muted">Loading applications...</p>;
  if (error) return <p className="p-4 text-danger">{error}</p>;

  return (
    <div className="container py-4">
      <h1 className="mb-4">All Applications</h1>

      {/* 🔍 react-select search (alphabetical) */}
      <div className="mb-4" style={{ maxWidth: 500 }}>
        <Select<Option, false>
          options={displayedOptions}
          value={selectedApplicant}
          onChange={(opt) => {
            setSelectedApplicant(opt);
            setInputValue("");
          }}
          onInputChange={(val, actionMeta) => {
            if (actionMeta.action === "input-change") {
              setInputValue(val);
            }
          }}
          inputValue={inputValue}
          isClearable
          placeholder="Search by applicant name or email..."
          noOptionsMessage={() => "No matches"}
        />
      </div>

      {filteredApplications.length === 0 ? (
        <p className="text-muted">No applications found.</p>
      ) : (
        <div className="row">
          {filteredApplications.map((app) => {
            const isLong = (app.coverLetter ?? "").length > 120;
            const truncated = isLong
              ? (app.coverLetter ?? "").slice(0, 120) + "..."
              : app.coverLetter ?? "";

            const coverLetterNode = (
              <>
                <span>{truncated}</span>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => openModal(app.coverLetter ?? "")}
                    className="btn btn-link p-0 ms-2"
                    style={{ color: "#0d6efd" }}
                  >
                    Read more
                  </button>
                )}
              </>
            );

            return (
              <div key={app.id} className="col-md-6 col-lg-4 mb-4">
                <ApplicationCard
                  jobTitle={app.jobTitle}
                  applicantName={app.applicantName}
                  applicantEmail={app.applicantEmail}
                  coverLetter={coverLetterNode as unknown as string}
                  cvUrl={app.cvUrl}
                  status={app.status}
                  responseNote={app.responseNote}
                  isAdmin
                  onAccept={() =>
                    handleRespond(
                      app.id,
                      "accepted",
                      "Congratulations! You're shortlisted."
                    )
                  }
                  onReject={(reason) =>
                    handleRespond(app.id, "rejected", reason)
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 🪟 Simple modal for full cover letter */}
      {modalOpen && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={closeModal}
            style={{ cursor: "pointer" }}
          />
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ background: "transparent" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Full Description</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <p>{modalContent}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApplicationPage;
