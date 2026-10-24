import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '../../users/users.service';

export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data && user ? user[data] : user;
  },
);
