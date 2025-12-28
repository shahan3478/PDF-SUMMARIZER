import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(signUpDto);
    const payload = { email: user.email, sub: user._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      user,
      signInDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async googleLogin(user: any) {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }

    let dbUser: UserDocument | null = await this.usersService.findByGoogleId(user.googleId);
    if (!dbUser) {
      dbUser = await this.usersService.findByEmail(user.email);
      if (dbUser) {
        dbUser.googleId = user.googleId;
        dbUser.avatar = user.avatar;
        await dbUser.save();
      } else {
        dbUser = await this.usersService.create({
          email: user.email,
          name: user.name,
          googleId: user.googleId,
          avatar: user.avatar,
        });
      }
    }

    if (!dbUser) {
      throw new UnauthorizedException('Failed to create or retrieve user');
    }

    const payload = { email: dbUser.email, sub: dbUser._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
      },
    };
  }
}