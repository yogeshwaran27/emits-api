import {
  Table, Column, Model, DataType, PrimaryKey, ForeignKey,
} from 'sequelize-typescript';
import { Company } from './company.entity';

@Table({ tableName: 'Users', schema: 'Prod', timestamps: false })
export class User extends Model<User> {
  @PrimaryKey
  @Column
  UserId: string;

  @ForeignKey(() => Company)
  @Column
  CompanyId: string;

  @Column
  UserType: 'Administrator' | 'Employee';

  @Column
  UserName: string;

  @Column
  UserPassword: string;

  @Column
  UserStatus: 'Active' | 'Inactive';

  @Column
  FirstName: string;

  @Column
  LastName: string;

  @Column
  CreatedBy: string;

  @Column({ type: DataType.DATE })
  CreatedDateTime: Date;

  @Column
  ModifiedBy: string;

  @Column({ type: DataType.DATE })
  ModifiedDateTime: Date;
}