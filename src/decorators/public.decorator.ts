import { SetMetadata } from '@nestjs/common';

/**
 * Création d'une metadonnée qui sera disponible lors de l'execution de la méthode où elle est appliquée.
 * cf.: auth.guard.ts pour traitement.
 * Le fait que auth.guard.ts traite la demande c'est parce qu'il est appelé de façon global depuis auth.module.ts
 */

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
