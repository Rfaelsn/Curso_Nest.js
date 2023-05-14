import {
  IsEmail,
  IsStrongPassword,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  birthAt: string;

  @IsStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;
}
