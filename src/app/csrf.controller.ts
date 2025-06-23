import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('csrf')
export class CsrfController {
  @Get('token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    // The CSRF token is automatically added to the request by the csurf middleware
    const csrfToken = req.csrfToken();

    // Return the token to the client
    return res.json({ csrfToken });
  }
}
