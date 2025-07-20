import { Body, Controller, Get, Post, Put, Query, UseGuards,Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto,DeActivateUserDto,ActivateUserDto, getUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.gaurd';
import { RolesGuard } from 'src/roles/roles.gaurd';
import { Roles } from 'src/roles/roles.decorator';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async getUser(@Query() getUserDto : getUserDto,@Request() req: any){
    return this.usersService.getUserById(getUserDto.PortalPersonUniqueId,req.cookies.company)
  }
  
  @Post('create')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async create(@Body() createUserDto: CreateUserDto,@Request() req: any) {
    return this.usersService.createUser(createUserDto,req.cookies.company,req.hostname);
  }
  
  @Post('activate')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async activateUser(@Body() activateUserDto:ActivateUserDto,@Request() req: any) {
    return this.usersService.activateUser(activateUserDto.PortalPersonUniqueId,req.cookies.company);
  }

  @Post('deactivate')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('SalesForce')
  async deactivateUser(@Body() deActivateUserDto: DeActivateUserDto,@Request() req: any) {
    return this.usersService.deactivateUser(deActivateUserDto.PortalPersonUniqueId,req.cookies.company);
  }

  @Put('reset-password')
  @UseGuards(AuthGuard,RolesGuard)
  async resetPassword(@Body() body: { newPassword: string,firstTimeReset:boolean,oldPassword?:string },@Request() req: any) {
    if(body.firstTimeReset==false){
      const user = await this.usersService.getUserPass(req.cookies.mail);
      const passwordMatch = await bcrypt.compare(body.oldPassword, user?.UserPassword);
      if (!passwordMatch) {
        throw new UnauthorizedException('Password did not match');
      }
    }
    
    return this.usersService.updateUserPassword(req.cookies.mail, body.newPassword,req.user);
  }
}
