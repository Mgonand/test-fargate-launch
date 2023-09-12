import AWS from 'aws-sdk';
import { SESSION_DURATION_SECONDS } from './constants';

export async function getCredentialsForRole(
  roleArn: string,
  roleSessionName: string,
  durationSeconds = SESSION_DURATION_SECONDS,
) {
  const sts = new AWS.STS();
  const data = await sts
    .assumeRole({
      RoleArn: roleArn,
      RoleSessionName: roleSessionName,
      DurationSeconds: durationSeconds,
    })
    .promise();
  return data.Credentials;
}
