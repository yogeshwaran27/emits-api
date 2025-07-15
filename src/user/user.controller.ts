import { Body, Controller, Get, Post, Put, Query, UseGuards,Request } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto,DeActivateUserDto,ActivateUserDto, getUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.gaurd';
import { RolesGuard } from 'src/roles/roles.gaurd';
import { Roles } from 'src/roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async getUser(@Query() getUserDto : getUserDto){
    return this.usersService.getUserById(getUserDto.PortalPersonUniqueId)
  }
  
  @Post('create')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  
  @Post('activate')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async activateUser(@Body() activateUserDto:ActivateUserDto) {
    return this.usersService.activateUser(activateUserDto.PortalPersonUniqueId);
  }

  @Post('deactivate')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async deactivateUser(@Body() deActivateUserDto: DeActivateUserDto) {
    return this.usersService.deactivateUser(deActivateUserDto.PortalPersonUniqueId);
  }

  @Put('reset-password')
  @UseGuards(AuthGuard,RolesGuard)
  async resetPassword(@Body() body: { newPassword: string },@Request() req: any) {
    const loggedInUser = req.user; 
    console.log(body,req.user)
    return this.usersService.updateUserPassword(req.cookies.mail, body.newPassword,loggedInUser);
  }
}
