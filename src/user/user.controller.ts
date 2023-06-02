import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UserService } from './user.service';
import { LogInterceptor } from 'src/interceptors/log.interceptor';
import { ParamId } from 'src/decorators/param-id.decorator';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthGuard } from 'src/guards/auth.guard';

@Roles(Role.Admin)
// @UseGuards(ThrottlerGuard, AuthGuard, RoleGuard) define o throttler guard para o controller
@UseGuards(AuthGuard, RoleGuard) // a ordem dos guards é importante
@UseInterceptors(LogInterceptor)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @UseGuards(ThrottlerGuard) // usa as configs setadas no modulo app por padrão
  // @UseGuards(new ThrottlerGuard({})) sobrescreve as configs do throttler
  @Post()
  async create(@Body() data: CreateUserDTO) {
    return this.userService.create(data);
  }

  // @Roles(Role.Admin, Role.User) exemplo passando 2 tipos de permissao
  //@SkipThrottle() ignora o throttler definido
  //Throttler(20, 60) sobrescreve o limit e ttl padrão
  @Get()
  async list() {
    return this.userService.list();
  }

  // @Roles(Role.Admin) exemplo na rota
  @Get(':id')
  async show(@ParamId() id: number) {
    return this.userService.show(id);
  }

  @Put(':id')
  async update(
    @Body() data: UpdatePutUserDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.update(id, data);
  }

  @Patch(':id')
  async updatePartial(
    @Body() data: UpdatePatchUserDTO,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.updatePartial(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
