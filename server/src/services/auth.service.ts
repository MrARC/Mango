import { Service } from 'typedi';
import { NotFoundError } from 'routing-controllers';
import { User } from '../entities/user/user.model';
import { Token } from '../entities/token/token.model';
import { TokenRepository } from '../repositories/token.repository';
import { UserRepository } from '../repositories/user.repository';
import * as jwt from 'jsonwebtoken';
import * as httpContext from 'express-http-context';

@Service()
export class AuthService {

    constructor(private tokenRepository: TokenRepository, private userRepository: UserRepository) { }

    /**
     * Create a JWT token for specified user
     * @param user user Object
     * @param refresh should be refresh the token?
     * @returns {Promise<any>} promise with the result of the operation
     */
    public async createJWT(user: User, refresh?: boolean): Promise<any> {
        try {
            const token = await jwt.sign({
                user: {
                    id: user.id
                },
            }, process.env.JWT_SECRET, { expiresIn: '1m' });
            if (!refresh) {
                // create JWT entity instance to store in database
                const userAgent = httpContext.get('useragent');
                const tokenInstance = new Token();
                tokenInstance.token = token;
                tokenInstance.agent = userAgent;
                tokenInstance.last_time_used = new Date();
                tokenInstance.user = user; // asign relationship
                // now we save the token in our tokenrepository
                await this.tokenRepository.save(tokenInstance);
            }
            return token;
        } catch (error) {
            throw error;
        }
    }

    public async refreshToken(token: string, userID: number): Promise<any> {
        try {
            const userDB = await this.userRepository.findOne({ id: userID });
            if (!userDB) {
                throw new NotFoundError('User not found, can\'t refresh token');
            }
            const newToken = await this.createJWT(userDB, true);
            await this.tokenRepository.update({ token: token }, { token: newToken });
            return newToken;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verifies and decode a JWT token
     * @param token JWT token encoded
     */
    public async verifyToken(token: string): Promise<object | string> {
        return await jwt.verify(token, process.env.JWT_SECRET);
    }

    /**
     * Decode JWT token without verifyng signature
     * @param token JWT token
     */
    public async decodeToken(token: string): Promise<any> {
        return await jwt.decode(token);
    }
}
