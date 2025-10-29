// Company model definition
import { Model, DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/db";


export interface CompanyAttributes {
    company_id: number;
    company_name: string;
    company_description: string;
    company_location?: string;
    
}
export class CompanyModel extends Model<CompanyAttributes> implements CompanyAttributes {
    public company_id!: number;
    public company_name!: string;
    public company_description!: string;
    public company_location?: string;
}       
CompanyModel.init(
    {
        company_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        company_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company_description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        company_location: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize: sequelize as unknown as Sequelize,
        modelName: "Company",
        tableName: "companies",
        timestamps: false
    }
);  
export default CompanyModel;