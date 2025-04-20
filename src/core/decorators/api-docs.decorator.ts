import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Authorization } from './authorization.decorator';

import { UnauthorizedResponseDto } from '@common/interfaces/unauthorized-response.dto';

export interface ApiDocsParams {
    description: string;
    success: new () => unknown;
    error: new () => unknown;
}

export function ApiDocs(params: ApiDocsParams) {
    return applyDecorators(
        Authorization(true),
        ApiOperation({ description: params.description }),
        ApiOkResponse({ type: params.success }),
        ApiBadRequestResponse({ type: params.error }),
        ApiUnauthorizedResponse({ type: UnauthorizedResponseDto }),
        ApiInternalServerErrorResponse({ type: params.error })
    );
}