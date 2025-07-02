export class CreateUserResponseDto {
  status: 'Success' | 'Failed';
  reasonForFailure?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailId: string;
  portalPersonUniqueId: string;
  portalCompanyUniqueId: string;
}
