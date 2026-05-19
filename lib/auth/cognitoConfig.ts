export type CognitoConfig = {
  region: string;
  userPoolId: string;
  appClientId: string;
};

export function getCognitoConfig(): CognitoConfig {
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const appClientId = process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID;

  if (!region || !userPoolId || !appClientId) {
    throw new Error("Missing AWS Cognito environment variables.");
  }

  return {
    region,
    userPoolId,
    appClientId,
  };
}
