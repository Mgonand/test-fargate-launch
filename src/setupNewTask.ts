import AWS from 'aws-sdk';
import {EC2Client, DescribeVpcsCommand, DescribeSubnetsCommand} from '@aws-sdk/client-ec2';

export async function getSubnetsForClient(
  credentials: AWS.Credentials,
  client: string,
) {
  const ec2 = new EC2Client({
    region: 'eu-west-1',
    credentials: credentials,
    
  });
  const vpcsCommand = new DescribeVpcsCommand({
      Filters: [
        {
          Name: 'tag:client',
          Values: [client],
        },
      ],
    });
  const vpcs = await ec2.send(vpcsCommand);
  if (!vpcs.Vpcs || vpcs.Vpcs.length === 0) {
    throw new Error('No VPCs returned');
  }
  const subnetsCommand = new DescribeSubnetsCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [vpcs.Vpcs[0].VpcId || ''],
        },
      ],
    });
  const subnets = await ec2.send(subnetsCommand);
  if (!subnets.Subnets || subnets.Subnets.length === 0) {
    throw new Error('No subnets returned');
  }
  return subnets.Subnets;
}

export async function getSubnetsForClientOld(
  credentials: AWS.Credentials,
  client: string,
) {
  const ec2 = new AWS.EC2({
    region: 'eu-west-1',
    credentials: credentials,
  });
  const subnets = await ec2
    .describeSubnets({
      Filters: [
        {
          Name: 'tag:Name',
          Values: ['*public*'],
        },
        {
          Name: 'tag:client',
          Values: ['anaya'],
        }
      ],
    }).promise();
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
  const subnets = await getSubnetsForClientOld(credentials, 'anaya');
  const data = await ecs
    .runTask({
      cluster,
      taskDefinition: taskDefinitionName,
      count: 1,
      launchType,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: subnets.map((subnet) => subnet.SubnetId || ''),
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
