import AWS from 'aws-sdk';

async function getSubnetsForClient(
  credentials: AWS.Credentials,
  client: string,
) {
  const ec2 = new AWS.EC2({
    region: 'eu-west-1',
    credentials: credentials,
  });
  const vpcs = await ec2
    .describeVpcs({
      Filters: [
        {
          Name: 'tag:client',
          Values: [client],
        },
      ],
    })
    .promise();
  if (!vpcs.Vpcs || vpcs.Vpcs.length === 0) {
    throw new Error('No VPCs returned');
  }
  const subnets = await ec2
    .describeSubnets({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [vpcs.Vpcs[0].VpcId || ''],
        },
      ],
    })
    .promise(); // TODO: revisar error extraño: Error: XMLParserError: Non-whitespace before first tag.
  if (!subnets.Subnets || subnets.Subnets.length === 0) {
    throw new Error('No subnets returned');
  }
  return subnets.Subnets;
}

export async function setupNewTask(
  credentials: AWS.Credentials,
  taskDefinitionName: string,
  envVars: AWS.ECS.EnvironmentVariables,
  launchType: 'FARGATE' | 'FARGATE_SPOT' = 'FARGATE',
  cluster: string,
  cpu?: string,
  memory?: string,
  taskRoleArn?: string,
  executionRoleArn?: string,
) {
  const ecs = new AWS.ECS({
    region: 'eu-west-1',
    credentials: credentials,
  });
  // const subnets = await getSubnetsForClient(credentials, 'anaya');
  const data = await ecs
    .runTask({
      cluster,
      taskDefinition: taskDefinitionName,
      count: 1,
      launchType,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: process.env.VPC_SUBNETS?.split(',') || [],
          assignPublicIp: 'ENABLED',
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: 'app',
            environment: envVars,
          },
        ],
        cpu,
        memory,
        executionRoleArn,
        taskRoleArn,
      },
    })
    .promise();
  if (!data.tasks || data.tasks.length === 0) {
    throw new Error('No tasks returned');
  }
  return data.tasks[0];
}
