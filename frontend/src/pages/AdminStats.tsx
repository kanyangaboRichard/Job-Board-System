import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import axios from "axios";

interface Stats {
  users: number;
  jobs: number;
  applications: number;
  pending: number;
  accepted: number;
  rejected: number;
}

const AdminStats: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3005/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-primary">Admin Statistics</h2>
      {stats && (
        <div className="row">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="col-md-4 mb-3">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title text-capitalize">{key}</h5>
                  <p className="display-6 fw-bold text-info">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStats;
