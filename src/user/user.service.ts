import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils/md5';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user-dto';
import { LoginUserVo } from './vo/login-user.vo';
import { UpdatePasswordDto } from './dto/update-password.dot';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private logger = new Logger();

  @Inject(RedisService)
  private redisService: RedisService;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepsitory: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepsitory: Repository<Permission>;

  // 注册
  async register(user: RegisterUserDto) {
    // 邮箱验证码逻辑后期再完善
    // const captcha = await this.redisService.get(`captcha_${user.email}`);
    // console.log(captcha);

    // if (!captcha) {
    //   throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    // }

    // if (user.captcha !== captcha) {
    //   throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
    // }

    // 根据注册的用户名现在数据库中查一遍,看是否有相同的用户名,如果存在则注册失败
    const foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });

    if (foundUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    // 创建新用户
    const newUser = new User();
    newUser.username = user.username;
    newUser.nickName = user.nickname;
    newUser.password = md5(user.password);
    newUser.email = user.email;

    try {
      await this.userRepository.save(newUser);
    } catch (error) {
      this.logger.error(error, UserService);
      return '注册失败';
    }
  }

  // 登录
  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    // 现根据username和isAdmins在数据库中查一下,用户名如果找不到则提示用户不存在,isAdmin是代表查找user表中的isAdmin,false代表用户端,true代表管理端
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在!', HttpStatus.BAD_REQUEST);
    }

    if (md5(loginUserDto.password) !== user.password) {
      throw new HttpException('密码输入错误!', HttpStatus.BAD_REQUEST);
    }

    // 数据库中存在当前用户,密码也输入正确后,返回vo对象
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickname: user.nickName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      createTime: user.createDate.getTime(),
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce<any[]>((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  // 查找
  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });

    const vo = {
      id: user?.id,
      username: user?.username,
      nickname: user?.nickName,
      isAdmin: user?.isAdmin,
      roles: user?.roles.map((item) => item.name),
      permissions: user?.roles.reduce<any[]>((arr, item) => {
        item.permissions.forEach((permission) => {
          if (arr.indexOf(permission) === -1) {
            arr.push(permission);
          }
        });
        return arr;
      }, []),
    };

    return vo;
  }

  // 根据用户id获取用户信息
  async findInfoById(userId: number) {
    const info = this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return info;
  }

  // 修改密码
  async updatePassword(userId: number, passwordDto: UpdatePasswordDto) {
    const user: any = await this.userRepository.findOneBy({
      id: userId,
    });

    console.log(user);
    user.password = md5(passwordDto.password);

    console.log(user.password);

    console.log(user);
    try {
      await this.userRepository.save(user);
      return '密码修改成功!';
    } catch (error) {
      throw new HttpException('密码修改失败!', HttpStatus.BAD_REQUEST);
    }
  }

  // 更新用户信息
  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    console.log(userId);
    const user: any = await this.userRepository.findOneBy({
      id: userId,
    });

    if (updateUserDto.avatar) {
      user.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.nickName) {
      user.nickName = updateUserDto.nickName;
    }

    if (updateUserDto.phoneNumber) {
      user.phoneNumber = updateUserDto.phoneNumber;
    }

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    try {
      this.userRepository.save(user);
      return '用户信息修改成功!';
    } catch (error) {
      this.logger.debug(error, UserService);
      return '用户信息修改失败!';
    }
  }

  // 初始化数据
  async initData() {
    const user1 = new User();
    user1.username = 'zhangxinxin';
    user1.password = md5('123456');
    user1.email = '1285367184@qq.com';
    user1.isAdmin = true;
    user1.nickName = '张鑫鑫';
    user1.phoneNumber = '17775979964';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('2222222');
    user2.email = '555555@qq.com';
    user2.nickName = '李四';
    user2.phoneNumber = '12222222222';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'aaa';
    permission1.description = '访问 aaa 接口';

    const permission2 = new Permission();
    permission2.code = 'bbb';
    permission2.description = '访问 bbb 接口';

    user1.roles = [role1];

    user2.roles = [role2];

    role1.permissions = [permission1, permission2];

    role2.permissions = [permission2];

    await this.permissionRepsitory.save([permission1, permission2]);
    await this.roleRepsitory.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }
}
