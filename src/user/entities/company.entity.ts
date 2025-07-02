import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ tableName: 'Companies', schema: 'Prod', timestamps: false })
export class Company extends Model<Company> {
  @PrimaryKey
  @Column
  CompanyId: string;

  @Column
  FieldName: string;

  @Column
  SubDomain: string;

  @Column
  CompanyLogoUrl: string;

  @Column
  CompanySystemApiUserId: string;

  @Column
  CompanySystemApiPwd: string;

  @Column
  CompanySystemApiURL: string;
}
