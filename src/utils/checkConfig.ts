/**
 * Refuses to start with an unsafe or incomplete configuration (see .env.example).
 * Imported at the top of src/server.tsx, before the database and Redis clients are created.
 */
import { getConfigErrors } from '../config';

const configErrors = getConfigErrors();
if (configErrors.length > 0) {
    configErrors.forEach(error => console.error(`[config] ${error}`));
    process.exit(1);
}
