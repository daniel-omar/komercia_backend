import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';

import { ProfileDao } from '../dao/profile.dao';
import { User } from '@modules/auth/entities/user.entity';

@Injectable()
export class ProfileService {

  constructor(
    private profileDao: ProfileDao
  ) { }

  async getAll(): Promise<any> {
    // console.log(idSale)
    try {
      let profiles = await this.profileDao.getAll();
      return profiles;
    } catch (error) {
      return []
    }

  }

}
