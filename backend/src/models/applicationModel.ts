import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db"; // your Sequelize instance



export interface applicationModelAttributes {
  id: number;
  job_id: number;
  user_id: number;
  cover_letter?: string;
  cv_url?: string;
  status?: "pending" | "accepted" | "rejected";
  response_note?: string | null;
  applied_at?: Date;
  updated_at?: Date;

}
export type ApplicationCreationAttributes = Optional<applicationModelAttributes, "id" | "status" | "response_note" | "applied_at" | "updated_at">;

export class applicationModel extends Model<applicationModelAttributes,
 ApplicationCreationAttributes> 
 implements applicationModelAttributes {
  
  public id!: number;
  public job_id!: number;
  public user_id!: number;
  public cover_letter?: string;
  public cv_url?: string  ;
  public status?: "pending" | "accepted" | "rejected" ;
  public response_note?: string | null ;
  public applied_at?: Date ;
  public updated_at?: Date ;  
}
// Initialize the model
(applicationModel as any).init(
  {       

    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      autoIncrement: true, 
      primaryKey: true  
    },
    job_id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false

    },
    user_id: { 
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    cover_letter: { 
      type: DataTypes.TEXT,

      allowNull: true

    },

    cv_url: { 
      type: DataTypes.STRING,
      allowNull: true
    },
    status: { 
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "pending"
    },
    response_note: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null

    },
    applied_at: { 
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }     
  },
  {
    sequelize,
    tableName: "applications",
    timestamps: false,
    modelName: "applicationModel"
  }
);
