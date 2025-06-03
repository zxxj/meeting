import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  Query,
  HttpException,
  HttpStatus,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequiredLogin, UserInfo } from 'src/decorator';
import { UserInfoVo } from './vo/user-info.vo';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { generateParseIntPipe } from 'src/utils/generateParseIntPipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUserVo } from './vo/login-user.vo';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { CaptchaQueryDto } from './dto/captcha-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/utils/my-file-storage';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  // 注册
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码不正确/用户已存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/失败',
    type: String,
  })
  @Post('register')
  register(@Body() registerBody: RegisterUserDto) {
    return this.userService.register(registerBody);
  }

  // 注册: 验证码
  @ApiQuery({
    name: 'address',
    type: String,
    description: '邮箱地址',
    required: true,
    example: 'xxxx@xx.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册验证码发送成功!',
    type: String,
  })
  @Get('register-captcha')
  async captcha(@Query() query: CaptchaQueryDto) {
    const { address } = query;

    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendEmail({
      to: address,
      subject: '注册验证码',
      html: `<p>您的注册验证码是${code}</p>`,
    });

    return '注册验证码发送成功!';
  }

  // 修改密码: 验证码
  @ApiQuery({
    name: 'address',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: '发送成功',
  })
  @RequiredLogin()
  @Get(['password-captcha', 'admin/password-captcha'])
  async updatePasswordCaptcha(@UserInfo('email') email: string) {
    console.log('email!!!', email);

    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(
      `update_password_captcha_${email}`,
      code,
      5 * 60,
    );

    await this.emailService.sendEmail({
      to: email,
      subject: '会议室系统更改密码验证码',
      html: `<p>您的更改密码验证码是${code}</p>`,
    });

    return '会议室系统更改密码验证码发送成功!';
  }

  // 修改用户信息: 验证码
  @Get(['update-captcha', 'admin/update-captcha'])
  @RequiredLogin()
  async updateUserCaptcha(@UserInfo('email') email: string) {
    console.log('email!!!', email);
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`update_user_captcha_${email}`, code, 5 * 60);

    await this.emailService.sendEmail({
      to: email,
      subject: '会议室系统更新用户信息验证码',
      html: `<p>您的更新用户信息验证码是${code}</p>`,
    });

    return '会议室系统更新用户信息验证码发送成功!';
  }

  // 用户端登录
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
  @Post('login')
  async userLogin(@Body() userLoginDto: LoginUserDto) {
    // 拿到vo对象
    const vo = await this.userService.login(userLoginDto, false);

    // 生成accesstoken和refreshtoken
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time'),
      },
    );

    // 返回vo对象
    return vo;
  }

  // 管理端登录
  @ApiBody({
    type: LoginUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 token',
    type: LoginUserVo,
  })
  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: LoginUserDto) {
    const vo = await this.userService.login(adminLoginDto, true);

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        nickname: vo.userInfo.nickname,
        phoneNumber: vo.userInfo.phoneNumber,
        email: vo.userInfo.email,
        roles: vo.userInfo.roles,
        permission: vo.userInfo.permissions,
      },
      {
        expiresIn: this.configService.get('jwt_refresh_token_expires_time'),
      },
    );
    return vo;
  }

  // 获取用户信息
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
    type: UserInfoVo,
  })
  @Get(['info', 'admin/info'])
  @RequiredLogin()
  async info(@UserInfo('userId') userId: number) {
    const userInfo = await this.userService.findInfoById(userId);

    const vo = new UserInfoVo();
    vo.id = userInfo?.id as number;
    vo.username = userInfo?.username as string;
    vo.nickname = userInfo?.nickname as string;
    vo.avatar = userInfo?.avatar as string;
    vo.email = userInfo?.email as string;
    vo.phoneNumber = userInfo?.phoneNumber as string;
    vo.isFrozen = userInfo?.isFrozen as boolean;
    vo.isAdmin = userInfo?.isAdmin as boolean;
    vo.createTime = userInfo?.createDate as Date;
    vo.updateTime = userInfo?.updateDate as Date;

    return vo;
  }

  // 修改密码
  @ApiBody({
    type: UpdatePasswordDto,
  })
  @ApiResponse({
    type: String,
    description: '验证码已失效/不正确',
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdatePasswordDto) {
    return this.userService.updatePassword(passwordDto);
  }

  // 更新个人信息
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String,
  })
  @Post(['update', 'admin/update'])
  @RequiredLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userId, updateUserDto);
  }

  // 用户端刷新token
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        isAdmin: user,
        roles: user.roles,
        permissions: user.permissions,
      });

      const refresh_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
      });

      const vo = new RefreshTokenVo();

      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo;
    } catch (error) {
      throw new HttpException(
        'token已过期,请重新登陆!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 管理端刷新token
  @Get('admin/refresh')
  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxxxxxxyyyyyyyyzzzzz',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, false);

      const access_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        roles: user.roles,
        permissions: user.permissions,
      });

      const refresh_token = this.jwtService.sign({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        isAdmin: user.isAdmin,
        roles: user.roles,
        permissions: user.permissions,
      });

      const vo = new RefreshTokenVo();

      vo.access_token = access_token;
      vo.refresh_token = refresh_token;

      return vo;
    } catch (error) {
      throw new HttpException(
        'token已过期,请重新登陆!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 初始化数据
  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'done';
  }

  // 冻结用户
  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @RequiredLogin()
  @Get('admin/freeze')
  async freeze(@Query('id') id: number) {
    return this.userService.freezeById(id);
  }

  // 查询列表
  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: Number,
  })
  @ApiQuery({
    name: 'nickname',
    description: '昵称',
    type: Number,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: '用户列表',
  })
  @RequiredLogin()
  @Get(['list', 'admin/list'])
  async list(
    @Query('pageNum', new DefaultValuePipe(1), generateParseIntPipe('pageNum'))
    pageNum: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(2),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,

    @Query('username') username: string,
    @Query('nickname') nickname: string,
    @Query('email') email: string,
  ) {
    return this.userService.findUserByPage(
      pageNum,
      pageSize,
      username,
      nickname,
      email,
    );
  }

  // 图片上传
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: storage,
      dest: 'uploads',
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter(req, file, callback) {
        const exname = path.extname(file.originalname);

        if (['.png', '.jpg', '.gif', '.svg'].includes(exname)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('只能上传图片!'), false);
        }
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);
    return file.path;
  }
}
