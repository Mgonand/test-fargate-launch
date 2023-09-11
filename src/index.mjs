import AWS from 'aws-sdk';
import { getCredentialsForRole } from './getCredentialsForRole.mjs';
import { ROLE_ARN, ROLE_SESSION_NAME } from './constants.mjs';

async function main() {
  const credentials = await getCredentialsForRole(ROLE_ARN, ROLE_SESSION_NAME);
  

}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });