# Hosting a Docker NextJs project on AWS

This is a project with different stacks to showcase how to host a Docker NextJs project on AWS.

## Create the NextJs project

- `gerServerSideProps` to make sure SSR is available
- copy Dockerfile from https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile
- In all stacks, the NexJs project is dockerized with DockerImageAsset. Make sure the docker daemon is running

## Hosting with App Runner

- npm install @aws-cdk/aws-apprunner-alpha
- use the L2 construct `Service`

## Hosting with App Runner with Auto Scaling Configuration

- npm install cdk-apprunner-autoscaling
- define the Auto Scaling Configuration
- use the L1 construct `CfnService`
