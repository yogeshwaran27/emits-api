import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'UserDetails', schema: 'Prod', timestamps: false  })
export class UserDetails extends Model<UserDetails> {
  @Column({ type: DataType.STRING, primaryKey: true })
  declare UserId: string;

  @Column(DataType.STRING)
  declare CompanyId: string;

  @Column(DataType.STRING)
  declare UserType: string;

  @Column(DataType.STRING)
  declare UserName: string;

  @Column(DataType.STRING)
  declare EmailId: string;

  @Column(DataType.BOOLEAN)
  declare EmailVerified: boolean;

  @Column(DataType.STRING)
  declare PhoneNumber: string;

  @Column(DataType.BOOLEAN)
  declare PhoneVerified: boolean;

  @Column(DataType.STRING)
  declare UserPassword: string;

  @Column(DataType.STRING)
  declare UserStatus: string;

  @Column(DataType.STRING)
  declare FirstName: string;

  @Column(DataType.STRING)
  declare LastName: string;

  @Column(DataType.STRING)
  declare CreatedBy: string;

  @Column(DataType.DATE)
  declare CreatedDateTime: Date;

  @Column(DataType.STRING)
  declare ModifiedBy: string;

  @Column(DataType.DATE)
  declare ModifiedDateTime: Date;

  @Column(DataType.BOOLEAN)
  declare ForcePasswordReset: boolean;
}
