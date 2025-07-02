import { Body, Controller, Post, Query } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto,DeActivateUserDto,ActivateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  
  @Post('activate')
  activateUser(@Body() activateUserDto:ActivateUserDto) {
    return this.usersService.activateUser(activateUserDto.PortalPersonUniqueId);
  }

  @Post('deactivate')
  deactivateUser(@Body() deActivateUserDto: DeActivateUserDto) {
    return this.usersService.deactivateUser(deActivateUserDto.PortalPersonUniqueId);
  }
}
