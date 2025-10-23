import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import sequelize from "../config/db";
import bcrypt from "bcrypt";


export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  created_at?: Date;
}


export type UserCreationAttributes = Optional<UserAttributes, "id" | "role" | "created_at">;


export class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "user";
  public created_at?: Date;

  
  public async validPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}


UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelize as unknown as Sequelize,
    tableName: "users",
    modelName: "UserModel",
    timestamps: false, 
  }
);
export default UserModel;
