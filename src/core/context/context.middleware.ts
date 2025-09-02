import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContextService, ContextUser } from './context.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const jwtPayload = (req as any).user;
    let userForContext: ContextUser | undefined = undefined;

    if (jwtPayload && jwtPayload.sub) {
      userForContext = { id: jwtPayload.sub };
    }

    const requestId = randomUUID();

    this.contextService.run(() => {
      next();
    }, { user: userForContext, requestId });
  }
}

