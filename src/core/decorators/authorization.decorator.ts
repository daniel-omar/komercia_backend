import { SetMetadata } from '@nestjs/common';

export const Authorization = (secured: boolean) =>
  SetMetadata('authorizated', secured);
