import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para extraer el userId o payload del usuario autenticado en la petición.
 * Revisa `req.userId`, `req.user?.userId`, `req.query.userId`, `req.params.id`, o `req.body.userId`.
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const rawId =
      request.userId ??
      request.user?.userId ??
      request.query?.userId ??
      request.params?.id ??
      request.body?.userId;

    return rawId ? Number(rawId) : undefined;
  },
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
