"use strict";
/**
 * Auth Middleware - Geek Gaming Center
 * Middleware simple pour l'authentification (placeholder pour l'instant)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireAuth = requireAuth;
function authenticateToken(req, res, next) {
    // TODO: Implémenter une véritable authentification
    // Pour l'instant, on laisse passer tout
    next();
}
function requireAuth(req, res, next) {
    // TODO: Vérifier que l'utilisateur est authentifié
    next();
}
//# sourceMappingURL=auth.middleware.js.map