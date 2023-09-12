import AWS from 'aws-sdk';
import { getCredentialsForRole } from './getCredentialsForRole';
import { ROLE_ARN, ROLE_SESSION_NAME } from './constants';

try {
  const credentials = await getCredentialsForRole(ROLE_ARN, ROLE_SESSION_NAME);
} catch (e) {
  console.error(e);
}
