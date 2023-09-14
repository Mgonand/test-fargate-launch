import AWS from 'aws-sdk';
import { EC2ServiceException } from '@aws-sdk/client-ec2';
import { getCredentialsForRole } from './getCredentialsForRole';
import { ACCOUNT_ID, ROLE_ARN, ROLE_SESSION_NAME } from './constants';
import { setupNewTask } from './setupNewTask';

const TASK_ENV_VARS = [
  { name: 'NODE_ENV', value: 'production' },
  { name: 'CONVERSION_ID', value: process.env.CONVERSION_ID || '' },
  { name: 'DIRECTUS_TOKEN', value: process.env.DIRECTUS_TOKEN || '' },
  { name: 'DIRECTUS_URL', value: process.env.DIRECTUS_URL || '' },
  { name: 'AWS_BUCKET_NAME', value: process.env.AWS_BUCKET_NAME || '' },
  { name: 'AWS_CLOUDFRONT_URL', value: process.env.AWS_CLOUDFRONT_URL || '' },
];

try {
  const credentials = await getCredentialsForRole(ROLE_ARN, ROLE_SESSION_NAME);
  if (!credentials) {
    throw new Error('No credentials returned');
  }
  console.log(credentials.AccessKeyId,credentials.SecretAccessKey, credentials.SessionToken);
  const awsCredentials = new AWS.Credentials(
    credentials.AccessKeyId,
    credentials.SecretAccessKey,
    credentials.SessionToken,
  );
  await setupNewTask(
    awsCredentials,
    // 'rg-obfuscation-service',
    'rg-converter',
    TASK_ENV_VARS,
    'FARGATE',
    'anaya-test',
    undefined,
    undefined,
    `arn:aws:iam::${ACCOUNT_ID}:role/${process.env.TASK_ROLE_NAME || ''}`,
  );
} catch (e) {
  if ((e as EC2ServiceException).$response) {
    const ec2Exception = e as EC2ServiceException;
    console.error(`StatusCode: ${ec2Exception.$response?.statusCode}`);
  } else {
    console.error(e);
  }
}
