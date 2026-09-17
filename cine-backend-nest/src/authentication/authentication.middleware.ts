import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authenticateJWT = (req: Request, res: Response, next: NextFunction): Response | void => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de autenticacion no proporcionado' });
      }

      const token = authHeader.split(' ')[1];

      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET no configurado');

        const decoded = jwt.verify(token, secret) as JwtPayload;

        req.userId = decoded.userId?.toString();

        return next();
      } catch {
        return res.status(401).json({ error: 'Token inválido o expirado' });
      }
    };

    return authenticateJWT(req, res, next);
  }
}