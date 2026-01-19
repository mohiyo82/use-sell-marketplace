import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from "class-validator";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must be 8+ chars, include uppercase, lowercase, digit & special char',
  })
  password: string;
}
