import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CustomHttpException } from 'src/exceptions/customhttp.exception';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
// import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { TypeTokenEnum } from '@prisma/client';
import { Public } from 'src/decorators/public.decorator';
import { IRequestWithRefresh } from './type';
import { ResfreshGuard } from './guards/refresh.guard';

@Public() // Décorateur pour permettre l'accès à tous les utilisateurs
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    // vérification que body.email existe déjà en base ?
    const user = await this.usersService.findOneByEmail(registerDto.email);
    if (user) {
      throw new CustomHttpException(
        'User already exists',
        HttpStatus.CONFLICT,
        'AC-r-1',
      );
    }
    // hashage du mot de passe
    // registerDto.password = await argon2.hash(registerDto.password);
    registerDto.password = await bcrypt.hash(registerDto.password, 10);
    // création du user
    const new_user = await this.usersService.create(registerDto);
    // envoi du mail de confirmation

    // return success
    return { user: new_user };
  }

  @HttpCode(HttpStatus.OK) // Décorateur pour renvoyer un code 200
  @Post('login') // Route pour la connexion
  async login(
    @Body() loginDto: LoginDto, // Décorateur pour récupérer les données du corps de la requête
  ): Promise<{ access_token: string; refresh_token: string }> {
    // vérification si email existe get user by email
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new CustomHttpException(
        'Invalid credentials!!!!',
        HttpStatus.UNAUTHORIZED,
        'AC-l-1',
      );
    }

    // comparaison du password
    // if (!(await argon2.verify(user.password, loginDto.password))) {
    //   throw new CustomHttpException(
    //     'Invalid credentials',
    //     HttpStatus.UNAUTHORIZED,
    //     'AC-l-2',
    //   );
    // }
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new CustomHttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
        'AC-l-2',
      );
    }

    // génération du JWT
    const access_token = await this.authService.createJwt(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRATION_TIME,
    );

    // génération du refresh token
    const refresh_token = await this.authService.createJwt(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRATION_TIME,
    );

    //modifier la bdd, si refresh existe update, sinon create
    await this.authService.upsertToken(
      user.id,
      // await argon2.hash(refresh_token),
      await bcrypt.hash(refresh_token.split('.')[2], 10), // On hash la signature du refreshToken
      TypeTokenEnum.REFRESH,
    );

    // return success
    return {
      access_token,
      refresh_token,
    };
  }

  @Get('refresh-token')
  @UseGuards(ResfreshGuard) // Décorateur pour vérifier le refreshToken
  async refreshToken(@Req() req: IRequestWithRefresh) {
    // verifier le refreshToken => date expiration // malformed // existe // et bonne signature

    // verifier si refreshToken existe et est bien formé
    const { token } = await this.authService.getByUnique(
      req.user.sub,
      TypeTokenEnum.REFRESH,
    );
    // On récupère la signature du refreshToken
    const refreshSign = req.refresh.split('.')[2];
    console.log('🚀 ~ refreshToken ~ refreshSign:', refreshSign);
    // if (!(await argon2.verify(token, req.refresh))) {
    //   throw new CustomHttpException(
    //     'Wrong refreshToken',
    //     HttpStatus.UNAUTHORIZED,
    //     'AC-g-refresh',
    //   );
    if (!(await bcrypt.compare(refreshSign, token))) {
      throw new CustomHttpException(
        'Wrong refreshToken',
        HttpStatus.UNAUTHORIZED,
        'AC-g-refresh',
      );
    }

    // generate jwt
    const access_token = await this.authService.createJwt(
      { sub: req.user.sub, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRATION_TIME,
    );

    // refresh
    const refresh_token = await this.authService.createJwt(
      { sub: req.user.sub, email: req.user.email, role: req.user.role },
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_REFRESH_EXPIRATION_TIME,
    );

    // update refresh-token
    await this.authService.upsertToken(
      req.user.sub,
      // await argon2.hash(refresh_token),
      await bcrypt.hash(refresh_token.split('.')[2], 10),
      TypeTokenEnum.REFRESH,
    );

    // return success
    return {
      access_token,
      refresh_token,
    };
  }
}
