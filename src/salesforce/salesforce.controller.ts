import { Query, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.gaurd';
import { RolesGuard } from 'src/roles/roles.gaurd';
import { SalesforceService } from './salesforce.service';

@Controller('salesforce')
export class SalesforceController {
    constructor(private readonly salesForceService: SalesforceService) {}
    @Get('timeSheet')
      @UseGuards(AuthGuard,RolesGuard)
      async getTimeSheet(@Request() req: any) {
        return this.salesForceService.getTimeSheet(req.user.UserId)
      }
}
