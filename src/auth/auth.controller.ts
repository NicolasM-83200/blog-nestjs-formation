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
    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new CustomHttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
        'AC-l-2',
      );
    }
    // genere jwt
    const access_token = await this.authService.createJwt(
      { sub: user.id, email: user.email, role: user.role },
      process.env.SECRET_KEY,
      '5m',
    );
    // refresh
    const refresh_token = await this.authService.createJwt(
      { sub: user.id, email: user.email, role: user.role },
      process.env.SECRET_REFRESH_KEY,
      '1h',
    );
    //modifier la bdd, si refresh existe update, sinon create
    await this.authService.upsertToken(
      user.id,
      await bcrypt.hash(refresh_token, 10),
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
    const token = await this.authService.getByUnique(
      req.user.sub,
      TypeTokenEnum.REFRESH,
    );
    if (!(await bcrypt.compare(req.refresh, token.token))) {
      throw new CustomHttpException(
        'Wrong refreshToken',
        HttpStatus.UNAUTHORIZED,
        'AC-g-refresh',
      );
    }
    // generate jwt
    const access_token = await this.authService.createJwt(
      { sub: req.user.sub, email: req.user.email, role: req.user.role },
      process.env.SECRET_KEY,
      '5m',
    );
    // refresh
    const refresh_token = await this.authService.createJwt(
      { sub: req.user.sub, email: req.user.email, role: req.user.role },
      process.env.SECRET_REFRESH_KEY,
      '1h',
    );
    // update refresh-token
    await this.authService.upsertToken(
      req.user.sub,
      await bcrypt.hash(refresh_token, 10),
      TypeTokenEnum.REFRESH,
    );
    // return success
    return {
      access_token,
      refresh_token,
    };
  }
}
