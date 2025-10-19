export interface SecretRotationPlan {
  name: string;
  cadenceDays: number;
  owners: string[];
}

export const defaultSecretRotationPlan: SecretRotationPlan[] = [
  { name: 'SESSION_SECRET', cadenceDays: 30, owners: ['platform-security'] },
  { name: 'EMAIL_TOKEN_SECRET', cadenceDays: 30, owners: ['platform-security'] },
  { name: 'INTERNAL_ROUTE_PREFIX', cadenceDays: 7, owners: ['sre'] }
];
