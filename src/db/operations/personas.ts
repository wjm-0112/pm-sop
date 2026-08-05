import { db } from '@/db/index';
import { createCrud } from './crud';
import type { Persona } from '@/lib/types';

export const personaOps = createCrud<Persona>(db.personas);
