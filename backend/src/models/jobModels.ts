import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelize from "../config/db"; //Your Sequelize instance


export interface JobAttributes {
  id: number;
  title: string;
  description: string;
  company: string;
  posted_at: Date;
  created_at?: Date;
  salary: number;
  deadline: Date;
  company_id: number;
}


export type JobCreationAttributes = Optional<JobAttributes, "id" | "created_at">;


export class JobModel
  extends Model<JobAttributes, JobCreationAttributes>
  implements JobAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public company!: string;
  public posted_at!: Date;
  public created_at?: Date;
  public salary!: number;
  public deadline!: Date;
  public company_id!: number;
}


JobModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    posted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    salary: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize as unknown as Sequelize, 
    tableName: "jobs",
    modelName: "JobModel",
    timestamps: false, 
  }
);

export default JobModel;
