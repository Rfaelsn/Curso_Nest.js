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
import { MailerService } from '@nestjs-modules/mailer/dist';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'users';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly mailerService: MailerService,
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
          expiresIn: '10 minutes', // tempo de expiração
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

    const token = this.jwtService.sign(
      {
        id: user.id,
      },
      {
        expiresIn: '10 minutes', // tempo de expiração
        subject: String(user.id), //assunto do token
        issuer: 'forget', //modulo emissor
        audience: this.audience, //destinaratio do token
      },
    );

    await this.mailerService.sendMail({
      subject: 'Recuperação de senha',
      to: 'rafaelnascimentovf6@gmail.com',
      template: 'forget',
      context: {
        name: user.name,
        token,
      },
    });

    return true;
  }

  async reset(password: string, token: string) {
    try {
      const data: any = this.jwtService.verify(token, {
        issuer: 'forget', //modulo emissor
        audience: this.audience, //destinaratio do token
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('o token é inválido');
      }

      const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt()); //transforma a senha em hash

      const user = await this.prismaService.user.update({
        where: {
          id: Number(data.id),
        },
        data: {
          password: hashPassword,
        },
      });
      return this.createToken(user);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async register(data: AuthRegisterDTO) {
    const user = await this.userService.create(data);

    return this.createToken(user);
  }
}
