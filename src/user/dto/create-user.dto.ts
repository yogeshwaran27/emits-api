export class CreateUserDto {
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  EmailId: string;
  PortalPersonUniqueId: string;
  PortalCompanyUniqueId: string;
}

export class ActivateUserDto{
  PortalPersonUniqueId: string;
}

export class DeActivateUserDto{
  PortalPersonUniqueId: string;
}