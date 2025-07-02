import { Table, Column, Model, DataType, PrimaryKey, ForeignKey } from 'sequelize-typescript';
import { User } from './user.entity';

@Table({ tableName: 'UserContactDetails', schema: 'Prod', timestamps: false })
export class UserContactDetails extends Model<UserContactDetails> {
  @PrimaryKey
  @Column
  UserId: string;

  @Column
  EmailId: string;

  @Column
  EmailVerified: boolean;

  @Column
  PhoneNumber: string;

  @Column
  PhoneVerified: boolean;
}
