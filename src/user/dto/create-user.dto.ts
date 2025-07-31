export class CreateUserDto {
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  EmailId: string;
  PortalPersonUniqueId: string;
  PortalCompanyUniqueId: string;
  UserName:string;
}

export class ResetPasswordDto{ newPassword: string;firstTimeReset:boolean;oldPassword?:string }

export class ActivateUserDto{
  PortalPersonUniqueId: string;
}

export class DeActivateUserDto{
  PortalPersonUniqueId: string;
}

export class getUserDto{
  PortalPersonUniqueId: string;
}