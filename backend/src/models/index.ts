import  { applicationModel } from "./applicationModel";
import JobModel from "./jobModels";

//one job has many applications

JobModel.hasMany(applicationModel, { 
    foreignKey: 
    "job_id", as: "applications",
});
applicationModel.belongsTo(JobModel,
     {
     foreignKey:
     "job_id", as: "job",

});
export { applicationModel, JobModel };

