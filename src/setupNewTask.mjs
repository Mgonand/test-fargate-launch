import AWS from 'aws-sdk';

export async function setupNewTask(credentials, cluster, taskDefinition, envVars) {
  const ecs = new AWS.ECS({
    region: 'eu-west-1',
    credentials: credentials,
  });
  const data = await ecs.runTask({
    cluster,
    taskDefinition,
    count: 1,
    launchType: 'FARGATE', // FARGATE_SPOT
    overrides: {
      containerOverrides: [
        {
          name: 'app',
          environment: envVars,
        },
      ],
    }
  }).promise();
  return data.tasks[0];
}