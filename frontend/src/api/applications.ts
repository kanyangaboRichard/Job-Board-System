import api from "./apiClient";

export type Application = {
  id: string | number;
  jobTitle: string;
  status: "pending" | "accepted" | "rejected";
  responseNote?: string | null;
  applicantName?: string;
  applicantEmail?: string;
  coverLetter?: string;
  cvUrl?: string;
};

// Shape from backend (snake_case)
type ApplicationResponse = {
  id: number | string;
  job_title: string;
  status: "pending" | "accepted" | "rejected";
  response_note?: string | null;
  applicant_name?: string;
  applicant_email?: string;
  cover_letter?: string;
  cv_url?: string;
};

// Apply to job
export const applyToJob = async (
  jobId: number,
  coverLetter: string,
  resume: File
): Promise<Application> => {
  const formData = new FormData();
  formData.append("cover_letter", coverLetter);
  formData.append("cv", resume, resume.name);

  const res = await api.post<ApplicationResponse>(
    `/applications/${jobId}/apply`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return normalizeApplication(res.data);
};

// Get all applications (admin)
export const getApplications = async (): Promise<Application[]> => {
  const res = await api.get<ApplicationResponse[]>("/applications");
  return res.data.map(normalizeApplication);
};

// Get user applications
export const getUserApplications = async (): Promise<Application[]> => {
  const res = await api.get<ApplicationResponse[]>("/applications/user");
  return res.data.map(normalizeApplication);
};

// Respond to application
export const respondToApplication = async (
  id: number | string,
  status: "accepted" | "rejected",
  responseNote?: string
): Promise<Application> => {
  const res = await api.patch<ApplicationResponse>(`/applications/${id}`, {
    status,
    responseNote,
  });
  return normalizeApplication(res.data);
};

// helper to map snake_case → camelCase
function normalizeApplication(app: ApplicationResponse): Application {
  return {
    id: app.id,
    jobTitle: app.job_title,
    status: app.status,
    responseNote: app.response_note,
    applicantName: app.applicant_name,
    applicantEmail: app.applicant_email,
    coverLetter: app.cover_letter,
    cvUrl: app.cv_url,
  };
}
