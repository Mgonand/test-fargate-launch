import AWS from 'aws-sdk';

export async function setupNewTask(
  credentials: AWS.Credentials,
  taskDefinitionName: string,
  envVars: AWS.ECS.EnvironmentVariables,
  launchType: 'FARGATE' | 'FARGATE_SPOT' = 'FARGATE',
  cluster?: string,
  cpu?: string,
  memory?: string,
  taskRoleArn?: string,
  executionRoleArn?: string,
) {
  const ecs = new AWS.ECS({
    region: 'eu-west-1',
    credentials: credentials,
  });
  const data = await ecs
    .runTask({
      cluster,
      taskDefinition: taskDefinitionName,
      count: 1,
      launchType,
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
