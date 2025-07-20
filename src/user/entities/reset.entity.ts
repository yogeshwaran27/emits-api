import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'reset_tokens', schema: 'Prod', timestamps: false })
export class ResetTokens extends Model<ResetTokens> {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column(DataType.STRING)
  declare token: string;

  @Column(DataType.STRING)
  declare UserId: string;

  @Column(DataType.STRING)
  declare companyId: string;

  @Column(DataType.STRING)
  declare EmailId: string;

  @Column(DataType.DATE)
  declare expires_at: Date;

  @Column(DataType.BOOLEAN)
  declare used: boolean;

  @Column(DataType.DATE)
  declare created_at: Date;
}
