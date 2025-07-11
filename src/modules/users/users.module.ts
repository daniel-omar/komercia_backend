import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ProfileModule } from './profile/profile.module';
import { DocumentTypeModule } from './document_type/document_type.module';

@Module({
    imports: [
        UserModule,
        ProfileModule,
        DocumentTypeModule
    ]
})
export class UsersModule { }
