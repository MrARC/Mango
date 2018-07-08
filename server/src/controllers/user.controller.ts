import { Param, Get, Post, Res, UseBefore, JsonController, Body } from 'routing-controllers';
import { Response} from 'express';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { ResponseHandler, ResponseCode } from '../util/response.handler';
import * as morgan from 'morgan';

@JsonController('/user/')
@UseBefore(morgan('dev'))
export class UserController extends ResponseHandler {

    @Post()
    public async createUser(@Res() response: Response, @Body() user: User) {
        try {
            const result = await UserService.createUser(user);
            return this.createResponse(response, result, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to register user (user already registered)', 500, ResponseCode.ERROR);
        }
    }

    @Get(':email')
    public async getUserByEmail(@Res() response: Response, @Param('email') email: string) {
        try {
            const userData = await UserService.getUserByEmail(email);
            return this.createResponse(response, userData, 200, ResponseCode.SUCCESS_DATA);
        } catch (ex) {
            return this.createResponse(response, 'Unable to get user', 404, ResponseCode.NOT_FOUND);
        }
    }

}
