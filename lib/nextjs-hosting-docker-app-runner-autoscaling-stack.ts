import * as cdk from "aws-cdk-lib";
import * as apprunner from "aws-cdk-lib/aws-apprunner";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as iam from "aws-cdk-lib/aws-iam";
import { AppRunnerAutoScaling } from "cdk-apprunner-autoscaling";
import { Construct } from "constructs";

export class NextjsHostingDockerAppRunnerAutoScalingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageAsset = new ecrAssets.DockerImageAsset(this, "Image", {
      directory: "./webapp",
    });

    // create the Auto Scaling Configuration
    const autoScalingConfiguration = new AppRunnerAutoScaling(
      this,
      "AutoScalingConfiguration",
      {
        AutoScalingConfigurationName: `demo`,
        MaxConcurrency: 50,
        MinSize: 1,
        MaxSize: 1,
      }
    );

    // create the access role to pull the image from ECR
    const accessRole = new iam.Role(this, "AccessRole", {
      assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
    });
    accessRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["ecr:GetAuthorizationToken"],
        resources: ["*"],
      })
    );
    imageAsset.repository.grantPull(accessRole);

    // create the App Runner service
    const service = new apprunner.CfnService(this, "WebApp", {
      autoScalingConfigurationArn: autoScalingConfiguration.arn,
      instanceConfiguration: {
        cpu: "1 vCPU",
        memory: "2 GB",
      },
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        autoDeploymentsEnabled: true,
        imageRepository: {
          imageRepositoryType: "ECR",
          imageIdentifier: imageAsset.imageUri,
          imageConfiguration: {
            runtimeEnvironmentVariables: [
              {
                name: "RANDOM_IMAGE_API_URL",
                value: "https://random.imagecdn.app/500/500",
              },
            ],
          },
        },
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: "DEFAULT",
        },
      },
    });

    new cdk.CfnOutput(this, "ServiceUrl", { value: service.attrServiceUrl });
  }
}
