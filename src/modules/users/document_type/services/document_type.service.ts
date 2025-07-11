import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

import * as bcryptjs from 'bcryptjs';

import { DocumentTypeDao } from '../dao/document_type.dao';
import { User } from '@modules/auth/entities/user.entity';

@Injectable()
export class DocumentTypeService {

  constructor(
    private documentTypeDao: DocumentTypeDao
  ) { }

  async getAll(): Promise<any> {
    // console.log(idSale)
    try {
      let profiles = await this.documentTypeDao.getAll();
      return profiles;
    } catch (error) {
      return []
    }

  }

}
