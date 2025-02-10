import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

/**
 * Création d'une metadonnée qui sera disponible lors de l'execution de la méthode où elle est appliquée.
 * cf.: roles.guard.ts pour traitement.
 * Le fait que role.guard.ts traite la demande c'est parce qu'il est appelé de façon global depuis auth.module.ts
 */

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
