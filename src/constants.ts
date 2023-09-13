export const SESSION_DURATION_SECONDS = 900;
export const AWS_REGION = 'eu-west-1';
export const ACCOUNT_ID = process.env.ACCOUNT_ID;
export const ROLE_NAME = process.env.ROLE_NAME;
export const ROLE_SESSION_NAME = 'fargate-task-role-session';
export const ROLE_ARN = `arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}`;
