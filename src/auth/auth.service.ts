import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  createToken(user: User) {
    return {
      acessToken: this.jwtService.sign(
        // infos requeridas no payload
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '5 minutes', // tempo de expiração
          subject: String(user.id), //assunto do token
          issuer: this.issuer, //modulo emissor
          audience: this.audience, //destinaratio do token
          // notBefore: Math.ceil((Date.now() + 1000 * 60 * 60) / 1000), //data de inicialização da validade
        },
      ),
    };
  }

  checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        issuer: this.issuer,
        audience: this.audience, // se algum destes atrib for diferente do tk recebido não será validado
      });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail e/ou senha incorretos');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail e/ou senha incorretos');
    }

    return this.createToken(user);
  }
  async forget(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail está incorreto');
    }

    //enviar email

    return true;
  }
  async reset(password: string, token: string) {
    //validar token

    const id = 0;
    const user = await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        password: password,
      },
    });

    return this.createToken(user);
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }
}
