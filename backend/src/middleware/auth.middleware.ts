/**
 * Auth Middleware - Geek Gaming Center
 * Middleware simple pour l'authentification (placeholder pour l'instant)
 */

import { Request, Response, NextFunction } from 'express';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // TODO: Implémenter une véritable authentification
  // Pour l'instant, on laisse passer tout
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // TODO: Vérifier que l'utilisateur est authentifié
  next();
}
