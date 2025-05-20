import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  // 根据key获取redis中对应的value
  async get(key: string) {
    return await this.redisClient.get(key);
  }

  /**
   * @param key 键
   * @param value 值
   * @param ttl 过期时间,可选
   */
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }
}
