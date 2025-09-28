import React from "react";

type ApplicationCardProps = {
  id: number;
  title: string;
  location?: string;
  description?: string;
};

const ApplicationCard: React.FC<ApplicationCardProps> = ({ id, title, location, description }) => {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        {location && <h6 className="card-subtitle mb-2 text-muted">{location}</h6>}
        {description && <p className="card-text">{description}</p>}
        <p className="small text-muted">Job ID: {id}</p>
      </div>
    </div>
  );
};

export default ApplicationCard;
