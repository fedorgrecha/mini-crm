export const MYSQL_ERROR_CODES = {
  DUPLICATE_ENTRY: 'ER_DUP_ENTRY',
} as const;

export interface MySQLError extends Error {
  code: string;
  errno: number;
  sqlState?: string;
  sqlMessage?: string;
}

export function isMySQLError(error: unknown): error is MySQLError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

export function isDuplicateEntryError(error: unknown): boolean {
  return (
    isMySQLError(error) && error.code === MYSQL_ERROR_CODES.DUPLICATE_ENTRY
  );
}
