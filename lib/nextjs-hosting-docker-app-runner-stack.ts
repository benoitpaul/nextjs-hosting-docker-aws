import * as apprunner_alpha from "@aws-cdk/aws-apprunner-alpha";
import * as cdk from "aws-cdk-lib";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import { Construct } from "constructs";

export class NextjsHostingDockerAppRunnerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageAsset = new ecrAssets.DockerImageAsset(this, "Image", {
      directory: "./webapp",
    });

    const service = new apprunner_alpha.Service(this, "NextJsService", {
      source: apprunner_alpha.Source.fromAsset({
        asset: imageAsset,
      }),
      cpu: apprunner_alpha.Cpu.ONE_VCPU,
      memory: apprunner_alpha.Memory.TWO_GB,
    });
    service.addEnvironmentVariable(
      "RANDOM_IMAGE_API_URL",
      "https://random.imagecdn.app/500/500"
    );

    new cdk.CfnOutput(this, "ServiceUrl", { value: service.serviceUrl });
  }
}
