// import { Strategy } from 'passport-local';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { AuthService } from '../auth.service';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({ usernameField: 'email' });
//   }

//   /**
//    * Avec Passport
//    * @param email
//    * @param password
//    * @returns
//    */
//   async validate(email: string, password: string): Promise<any> {
//     return { email, password };
//   }
// }
