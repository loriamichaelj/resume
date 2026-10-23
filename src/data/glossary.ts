// -----------------------------------------------------------------------------
// Quick definitions for the technology tags in Projects and Experience and
// the tools marquee.
// Click a tag to open its card. Keys match the tag text exactly; `aliases`
// covers the same term written another way.
// -----------------------------------------------------------------------------

export type Term = {
  category: string;
  definition: string; // three short sentences
  docs?: { label: string; url: string }[];
  aliases?: string[];
};

export const glossary: Record<string, Term> = {
  Terraform: {
    category: "Infrastructure as code",
    definition:
      "Terraform is HashiCorp's tool for defining cloud infrastructure in declarative configuration files. You describe the resources you want, and it plans and applies the changes needed to get there. A state file tracks what exists, so the same code builds identical environments on AWS, Azure, GCP and more.",
    docs: [{ label: "Terraform docs", url: "https://developer.hashicorp.com/terraform/docs" }],
  },
  "EKS / AKS / GKE": {
    category: "Managed Kubernetes",
    definition:
      "EKS, AKS and GKE are the managed Kubernetes services of AWS, Azure and Google Cloud. The provider runs the Kubernetes control plane, so you only manage the worker nodes and the workloads on them. The same container images and Kubernetes manifests can run on all three.",
    docs: [
      { label: "Amazon EKS", url: "https://docs.aws.amazon.com/eks/" },
      { label: "Azure AKS", url: "https://learn.microsoft.com/en-us/azure/aks/" },
      { label: "Google GKE", url: "https://cloud.google.com/kubernetes-engine/docs" },
    ],
    aliases: ["EKS / AKS / GKE Management"],
  },
  EKS: {
    category: "AWS · Managed Kubernetes",
    definition:
      "Amazon EKS (Elastic Kubernetes Service) runs the Kubernetes control plane for you on AWS. You bring worker nodes, or let Fargate run pods without managing servers. It integrates with IAM, VPC networking and load balancers, so pods get AWS identities and traffic.",
    docs: [{ label: "Amazon EKS docs", url: "https://docs.aws.amazon.com/eks/" }],
  },
  ALB: {
    category: "AWS · Load balancing",
    definition:
      "An Application Load Balancer spreads incoming HTTP and HTTPS traffic across healthy targets such as EC2 instances, containers or Lambda functions. It routes requests by path, host or header, and can split traffic between target groups by weight. It also terminates TLS and runs health checks, so unhealthy targets stop receiving traffic.",
    docs: [
      {
        label: "ALB docs",
        url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
      },
    ],
  },
  "RDS PostgreSQL": {
    category: "AWS · Managed database",
    definition:
      "Amazon RDS for PostgreSQL is PostgreSQL run as a managed service on AWS. AWS handles provisioning, patching, automated backups and failover to a standby in another availability zone. You connect with standard PostgreSQL tools and drivers, just without running the database server yourself.",
    docs: [
      { label: "RDS for PostgreSQL", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html" },
    ],
  },
  "SQS / EventBridge": {
    category: "AWS · Messaging and events",
    definition:
      "Amazon SQS is a managed message queue that lets one service hand work to another and have it processed reliably, even if the consumer is slow or briefly down. Amazon EventBridge is an event bus that routes events to many targets based on rules. Together they decouple services, so each can scale, fail and deploy on its own.",
    docs: [
      {
        label: "Amazon SQS",
        url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html",
      },
      { label: "Amazon EventBridge", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" },
    ],
    aliases: ["EventBridge / SQS", "SQS"],
  },
  "Pub/Sub": {
    category: "Google Cloud · Messaging",
    definition:
      "Google Cloud Pub/Sub is a managed messaging service where publishers send messages to topics and subscribers receive them. It delivers each message at least once and buffers it until subscribers acknowledge it. Teams use it to decouple services and stream events, much like SQS and SNS on AWS.",
    docs: [{ label: "Pub/Sub overview", url: "https://cloud.google.com/pubsub/docs/overview" }],
  },
  "GitHub Actions": {
    category: "CI/CD",
    definition:
      "GitHub Actions is GitHub's built-in automation platform for building, testing and deploying code. Workflows are YAML files in the repository that run on events such as a push or a pull request. With OpenID Connect, workflows can deploy to the cloud without storing long-lived credentials.",
    docs: [{ label: "GitHub Actions docs", url: "https://docs.github.com/en/actions" }],
  },
  FastAPI: {
    category: "Python · Web framework",
    definition:
      "FastAPI is a modern Python framework for building REST APIs. It uses type hints to validate requests and to generate interactive OpenAPI documentation automatically. Built on async Python, it is fast and needs very little boilerplate.",
    docs: [{ label: "FastAPI docs", url: "https://fastapi.tiangolo.com/" }],
  },
  React: {
    category: "JavaScript · UI library",
    definition:
      "React is a JavaScript library for building user interfaces out of reusable components. Each component describes what the UI should look like for a given state, and React updates the page efficiently when that state changes. It is one of the most widely used tools for front ends.",
    docs: [{ label: "React docs", url: "https://react.dev/" }],
  },
  Lambda: {
    category: "AWS · Serverless compute",
    definition:
      "AWS Lambda runs your code in response to events without you managing any servers. It scales automatically from zero to many concurrent executions, and you pay only for the time your code runs. Common triggers include API requests, queue messages, file uploads and schedules.",
    docs: [{ label: "AWS Lambda docs", url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html" }],
  },
  DynamoDB: {
    category: "AWS · NoSQL database",
    definition:
      "Amazon DynamoDB is a fully managed NoSQL key-value and document database. It gives single-digit-millisecond reads and writes at any scale, with no servers to manage. You design tables around how your application reads its data, and it scales throughput automatically.",
    docs: [
      { label: "DynamoDB docs", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html" },
    ],
  },
  "EC2 / Auto Scaling": {
    category: "AWS · Compute",
    definition:
      "Amazon EC2 provides virtual servers, called instances, in the cloud. An Auto Scaling group keeps a fleet of identical instances at the right size, adding or removing them based on load or health. With a load balancer in front, it replaces failed instances automatically and can roll out new versions gradually.",
    docs: [
      { label: "Amazon EC2", url: "https://docs.aws.amazon.com/ec2/" },
      {
        label: "EC2 Auto Scaling",
        url: "https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html",
      },
    ],
    aliases: ["Auto Scaling"],
  },
  Packer: {
    category: "Machine images",
    definition:
      "Packer is HashiCorp's tool for building machine images, such as AWS AMIs, from a template. It boots a temporary instance, installs and configures software, then saves the result as a reusable image. Baking images in advance makes servers start faster and keeps every instance identical.",
    docs: [{ label: "Packer docs", url: "https://developer.hashicorp.com/packer/docs" }],
  },
  PostgreSQL: {
    category: "Relational database",
    definition:
      "PostgreSQL is a powerful open-source relational database known for reliability and standards-compliant SQL. It supports transactions, rich data types such as JSON, and extensions that add features. It runs everywhere, from a laptop to managed cloud services like Amazon RDS.",
    docs: [{ label: "PostgreSQL docs", url: "https://www.postgresql.org/docs/" }],
  },
  "Docker Compose": {
    category: "Containers · Local orchestration",
    definition:
      "Docker Compose defines and runs a multi-container application from a single YAML file. One command starts every service, such as the API, the database and the UI, with their networks and volumes. It is widely used for local development and for small single-host deployments.",
    docs: [{ label: "Docker Compose docs", url: "https://docs.docker.com/compose/" }],
  },
  Prometheus: {
    category: "Monitoring",
    definition:
      "Prometheus is an open-source monitoring system that collects metrics by regularly scraping HTTP endpoints. It stores them as time series and lets you query them with PromQL. Alerting rules fire when something looks wrong, and Grafana is often used to chart the data.",
    docs: [{ label: "Prometheus overview", url: "https://prometheus.io/docs/introduction/overview/" }],
  },
  Playwright: {
    category: "Testing",
    definition:
      "Playwright is a framework for end-to-end testing of web apps in real browsers: Chromium, Firefox and WebKit. Tests drive the page the way a user would, by clicking, typing and checking what appears. It waits for elements automatically, which makes tests more reliable in CI.",
    docs: [{ label: "Playwright docs", url: "https://playwright.dev/" }],
  },
  Docker: {
    category: "Containers",
    definition:
      "Docker packages an application and everything it needs into a container image that runs the same way on any machine. Images are built from a Dockerfile and stored in a registry such as Docker Hub or ECR. Containers start in seconds and isolate apps from each other, which is the basis for Kubernetes deployments.",
    docs: [{ label: "Docker overview", url: "https://docs.docker.com/get-started/docker-overview/" }],
  },
  "AWS IAM (OIDC)": {
    category: "AWS · Identity",
    definition:
      "AWS IAM controls who can do what in an AWS account, using roles and policies. With OpenID Connect, IAM can trust short-lived tokens from an outside identity provider, such as GitHub Actions. CI pipelines can then assume a role for a single job instead of keeping long-lived access keys.",
    docs: [
      {
        label: "IAM OIDC providers",
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html",
      },
      {
        label: "GitHub Actions OIDC",
        url: "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect",
      },
    ],
  },
  S3: {
    category: "AWS · Object storage",
    definition:
      "Amazon S3 is object storage for any amount of data, from files and backups to static websites. Data lives in buckets and is designed for very high durability, with access controlled by IAM and bucket policies. It is often used for build artifacts, logs, and Terraform state.",
    docs: [{ label: "Amazon S3 docs", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" }],
  },
  "Azure VNet": {
    category: "Azure · Networking",
    definition:
      "An Azure Virtual Network is your own private network inside Azure. You split it into subnets and place resources such as virtual machines in them to communicate securely. It is the foundation for connecting Azure resources to each other, to the internet and to on-premises networks.",
    docs: [
      {
        label: "Azure VNet overview",
        url: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview",
      },
    ],
    aliases: ["VNet"],
  },
  "VNet Peering": {
    category: "Azure · Networking",
    definition:
      "VNet peering connects two Azure virtual networks so their resources can talk privately over Microsoft's backbone. Peering is not transitive: if A peers with B and B with C, A still cannot reach C. That makes it a building block for hub-and-spoke designs that keep workloads isolated.",
    docs: [
      {
        label: "VNet peering overview",
        url: "https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview",
      },
    ],
  },
  NSGs: {
    category: "Azure · Network security",
    definition:
      "A network security group is a set of rules that allow or deny network traffic to Azure resources. Each rule matches on source, destination, port and protocol, and rules are evaluated in priority order. NSGs attach to subnets or network interfaces to lock access down, for example SSH only from one IP.",
    docs: [
      {
        label: "NSG overview",
        url: "https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview",
      },
    ],
  },
  "Azure CLI": {
    category: "Azure · Tooling",
    definition:
      "The Azure CLI is Microsoft's command-line tool for creating and managing Azure resources. Every action available in the portal can be scripted with az commands. That makes deployments repeatable and easy to automate in shell scripts and CI pipelines.",
    docs: [{ label: "Azure CLI docs", url: "https://learn.microsoft.com/en-us/cli/azure/" }],
  },
  Bash: {
    category: "Shell scripting",
    definition:
      "Bash is the standard command-line shell on Linux and macOS. Bash scripts chain commands together with variables, conditions and loops to automate tasks. In DevOps it is the glue for deployment scripts, CI steps and server setup.",
    docs: [{ label: "Bash manual", url: "https://www.gnu.org/software/bash/manual/" }],
  },
  AWS: {
    category: "Cloud platform",
    definition:
      "Amazon Web Services is the largest public cloud platform, with more than 200 services for compute, storage, databases, networking and more. You rent what you need on demand and pay for what you use, instead of buying and running hardware. Core building blocks include EC2, S3, VPC, IAM and RDS.",
    docs: [{ label: "AWS documentation", url: "https://docs.aws.amazon.com/" }],
  },
  Azure: {
    category: "Cloud platform",
    definition:
      "Microsoft Azure is Microsoft's public cloud platform for compute, storage, networking, databases and AI. It integrates closely with Microsoft tools such as Entra ID, Windows Server and Microsoft 365. Organisations often use it to run and migrate enterprise workloads, including hybrid setups that span their own data centres.",
    docs: [{ label: "Azure documentation", url: "https://learn.microsoft.com/en-us/azure/" }],
  },
  GCP: {
    category: "Cloud platform",
    definition:
      "Google Cloud Platform is Google's public cloud, running on the same infrastructure as Google's own products. It is known for Kubernetes (GKE), data analytics (BigQuery) and machine learning services. Like AWS and Azure, it offers on-demand compute, storage, networking and managed databases.",
    docs: [{ label: "Google Cloud docs", url: "https://cloud.google.com/docs" }],
  },
  Kubernetes: {
    category: "Container orchestration",
    definition:
      "Kubernetes is an open-source system for running containers across a cluster of machines. You declare what should run, such as how many copies of a service, and it schedules, restarts and scales containers to match. It handles service discovery, rolling updates and self-healing, and every major cloud offers it as a managed service.",
    docs: [{ label: "Kubernetes docs", url: "https://kubernetes.io/docs/home/" }],
  },
  Helm: {
    category: "Kubernetes · Packaging",
    definition:
      "Helm is the package manager for Kubernetes. It bundles an application's Kubernetes manifests into a versioned, configurable chart. One command installs, upgrades or rolls back a release, with values files to vary settings per environment.",
    docs: [{ label: "Helm docs", url: "https://helm.sh/docs/" }],
  },
  ArgoCD: {
    category: "GitOps · Continuous delivery",
    definition:
      "Argo CD is a GitOps continuous delivery tool for Kubernetes. It watches a Git repository and keeps the cluster in sync with the manifests stored there. Changes are deployed by merging to Git, and any drift in the cluster is shown and can be corrected automatically.",
    docs: [{ label: "Argo CD docs", url: "https://argo-cd.readthedocs.io/en/stable/" }],
  },
  Ansible: {
    category: "Configuration management",
    definition:
      "Ansible is an open-source automation tool for configuring servers and deploying software. Tasks are written in YAML playbooks and run over SSH, with no agent to install on the machines. Its modules are idempotent, so running a playbook again only changes what is out of date.",
    docs: [{ label: "Ansible docs", url: "https://docs.ansible.com/" }],
  },
  Grafana: {
    category: "Observability · Dashboards",
    definition:
      "Grafana is an open-source tool for visualising metrics, logs and traces on dashboards. It connects to data sources such as Prometheus, Loki, CloudWatch and many databases. Teams use it to watch system health at a glance and to set up alerts.",
    docs: [{ label: "Grafana docs", url: "https://grafana.com/docs/grafana/latest/" }],
  },
  OpenTelemetry: {
    category: "Observability · Instrumentation",
    definition:
      "OpenTelemetry is an open standard and set of SDKs for collecting traces, metrics and logs from applications. You instrument code once and send the data to any compatible backend, such as Jaeger, Prometheus or Datadog. It is a Cloud Native Computing Foundation project and the common way to add vendor-neutral observability.",
    docs: [{ label: "OpenTelemetry docs", url: "https://opentelemetry.io/docs/" }],
  },
  Datadog: {
    category: "Observability platform",
    definition:
      "Datadog is a cloud monitoring and observability platform delivered as a service. It gathers metrics, logs and traces from servers, containers and cloud services into one place. Dashboards, alerts and application performance monitoring help teams find and fix problems quickly.",
    docs: [{ label: "Datadog docs", url: "https://docs.datadoghq.com/" }],
  },
  Vault: {
    category: "Security · Secrets management",
    definition:
      "HashiCorp Vault stores and controls access to secrets such as passwords, API keys and certificates. Applications authenticate to Vault and receive only the secrets they are allowed to read, and every access is audited. It can also issue short-lived dynamic credentials, such as database logins that expire automatically.",
    docs: [{ label: "Vault docs", url: "https://developer.hashicorp.com/vault/docs" }],
  },
  Istio: {
    category: "Kubernetes · Service mesh",
    definition:
      "Istio is an open-source service mesh for Kubernetes. It adds a proxy alongside each service to handle the traffic between them, without changing application code. That gives mutual TLS encryption, fine-grained traffic routing and detailed telemetry across microservices.",
    docs: [{ label: "Istio docs", url: "https://istio.io/latest/docs/" }],
  },
  EC2: {
    category: "AWS · Compute",
    definition:
      "Amazon EC2 provides resizable virtual servers, called instances, in the AWS cloud. You choose the instance type, operating system image and network, and pay by the second while it runs. It is the basic building block for running applications on AWS.",
    docs: [{ label: "Amazon EC2 docs", url: "https://docs.aws.amazon.com/ec2/" }],
  },
  VPC: {
    category: "AWS · Networking",
    definition:
      "An Amazon VPC is your own isolated private network inside AWS. You choose its IP range, split it into public and private subnets, and control traffic with route tables and security groups. Everything from EC2 instances to databases and Kubernetes nodes runs inside one.",
    docs: [{ label: "Amazon VPC docs", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html" }],
  },
  IAM: {
    category: "Identity and access",
    definition:
      "Identity and access management decides who can do what to which cloud resources. In AWS IAM, users and roles get permissions through JSON policies, and every API call is checked against them. Least privilege means granting only the permissions a person or service actually needs.",
    docs: [
      { label: "AWS IAM", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html" },
      { label: "Azure RBAC", url: "https://learn.microsoft.com/en-us/azure/role-based-access-control/overview" },
      { label: "Google Cloud IAM", url: "https://cloud.google.com/iam/docs/overview" },
    ],
    aliases: ["IAM & Least Privilege"],
  },
  "Azure VMs": {
    category: "Azure · Compute",
    definition:
      "Azure Virtual Machines are on-demand Linux and Windows servers running in Azure. You pick a size, an image and a virtual network, and pay only while the machine runs. Scale sets add and remove identical VMs automatically as load changes.",
    docs: [{ label: "Azure VMs overview", url: "https://learn.microsoft.com/en-us/azure/virtual-machines/overview" }],
  },
  "Entra ID": {
    category: "Azure · Identity",
    definition:
      "Microsoft Entra ID, formerly Azure Active Directory, is Microsoft's cloud identity service. It signs users in to Azure, Microsoft 365 and thousands of other apps with single sign-on and multi-factor authentication. Azure role assignments and conditional access policies are built on its users, groups and app identities.",
    docs: [{ label: "Entra ID overview", url: "https://learn.microsoft.com/en-us/entra/fundamentals/whatis" }],
  },
  "Compute Engine": {
    category: "Google Cloud · Compute",
    definition:
      "Compute Engine is Google Cloud's service for running virtual machines. You choose a machine type and disk image, and instances start in seconds on Google's network. Managed instance groups keep a fleet of identical VMs healthy and scale it with load.",
    docs: [{ label: "Compute Engine docs", url: "https://cloud.google.com/compute/docs" }],
  },
  "Cloud IAM": {
    category: "Google Cloud · Identity",
    definition:
      "Google Cloud IAM controls who can act on which Google Cloud resources. You grant roles, which are bundles of permissions, to users, groups and service accounts at the organisation, folder, project or resource level. Permissions set higher up are inherited by everything below.",
    docs: [{ label: "Cloud IAM overview", url: "https://cloud.google.com/iam/docs/overview" }],
  },
  "Transit Gateway": {
    category: "AWS · Networking",
    definition:
      "AWS Transit Gateway is a central hub that connects many VPCs and on-premises networks. Instead of peering every network with every other, each one attaches to the hub once. Route tables on the gateway decide which networks can reach each other.",
    docs: [{ label: "Transit Gateway docs", url: "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html" }],
  },
  ExpressRoute: {
    category: "Azure · Hybrid networking",
    definition:
      "Azure ExpressRoute is a private, dedicated connection between an on-premises network and Microsoft's cloud. Traffic doesn't cross the public internet, so it is more reliable and has steadier latency than a VPN. Companies use it to link their data centres to Azure for hybrid workloads.",
    docs: [
      { label: "ExpressRoute overview", url: "https://learn.microsoft.com/en-us/azure/expressroute/expressroute-introduction" },
    ],
  },
  "ECR / ACR / Artifact Registry": {
    category: "Container registries",
    definition:
      "ECR, ACR and Artifact Registry are the private container registries of AWS, Azure and Google Cloud. CI pipelines push Docker images to them, and Kubernetes clusters pull those images to run. Access goes through each cloud's IAM, and images can be scanned for vulnerabilities on push.",
    docs: [
      { label: "Amazon ECR", url: "https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html" },
      { label: "Azure ACR", url: "https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro" },
      { label: "Artifact Registry", url: "https://cloud.google.com/artifact-registry/docs" },
    ],
    aliases: ["ECR", "ACR", "Artifact Registry"],
  },
  CloudFormation: {
    category: "AWS · Infrastructure as code",
    definition:
      "AWS CloudFormation builds AWS resources from templates written in YAML or JSON. Each template becomes a stack that CloudFormation creates, updates and deletes as a single unit. Change sets preview what an update will do, and a failed update rolls back automatically.",
    docs: [
      { label: "CloudFormation docs", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" },
    ],
  },
  Bicep: {
    category: "Azure · Infrastructure as code",
    definition:
      "Bicep is Microsoft's language for deploying Azure resources declaratively. It compiles to ARM templates but is much shorter and easier to read than the raw JSON. Modules let you reuse pieces, and a what-if preview shows the changes before you deploy.",
    docs: [
      { label: "Bicep overview", url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview" },
    ],
  },
  Jenkins: {
    category: "CI/CD",
    definition:
      "Jenkins is an open-source automation server for continuous integration and delivery. Pipelines are written as code in a Jenkinsfile that lives in the repository. Thousands of plugins connect it to almost any version control, build tool or cloud.",
    docs: [{ label: "Jenkins docs", url: "https://www.jenkins.io/doc/" }],
  },
  "Node.js": {
    category: "JavaScript · Runtime",
    definition:
      "Node.js runs JavaScript outside the browser, on servers and command lines. Its event loop and non-blocking I/O handle many connections at once without a thread per request. Together with npm's huge package ecosystem, it is a common choice for APIs and web back ends.",
    docs: [{ label: "Node.js docs", url: "https://nodejs.org/docs/latest/api/" }],
  },
  Redux: {
    category: "JavaScript · State management",
    definition:
      "Redux keeps an application's state in a single store that changes only through dispatched actions. Reducer functions describe how each action updates the state, so every change is predictable and easy to trace. Redux Toolkit is the standard way to write it, and it pairs closely with React.",
    docs: [{ label: "Redux docs", url: "https://redux.js.org/" }],
  },
  "Express.js": {
    category: "Node.js · Web framework",
    definition:
      "Express is a minimal web framework for Node.js. It maps HTTP routes to handler functions and runs requests through a chain of middleware for things like parsing, logging and authentication. It is the most widely used way to build REST APIs on Node.",
    docs: [{ label: "Express docs", url: "https://expressjs.com/" }],
  },
  "ELK / Loki": {
    category: "Observability · Logs",
    definition:
      "The ELK stack, Elasticsearch, Logstash and Kibana, collects logs, indexes them for full-text search and charts them on dashboards. Grafana Loki is a lighter alternative that indexes only labels, not the full log text, which keeps storage cheap. Both bring logs from every server and container into one place to search.",
    docs: [
      { label: "Elastic Stack", url: "https://www.elastic.co/elastic-stack" },
      { label: "Grafana Loki", url: "https://grafana.com/docs/loki/latest/" },
    ],
    aliases: ["ELK / Loki Stack"],
  },
  CloudWatch: {
    category: "AWS · Monitoring",
    definition:
      "Amazon CloudWatch collects metrics and logs from AWS services and your own applications. Alarms fire when a metric crosses a threshold and can notify a team or trigger automatic actions. Dashboards and Logs Insights queries help track down problems.",
    docs: [
      { label: "CloudWatch docs", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" },
    ],
  },
  "Azure Monitor": {
    category: "Azure · Monitoring",
    definition:
      "Azure Monitor collects metrics, logs and traces from Azure resources, applications and on-premises machines. Logs are stored in Log Analytics workspaces and queried with the Kusto Query Language. Alerts, workbooks and Application Insights build on the same data.",
    docs: [{ label: "Azure Monitor overview", url: "https://learn.microsoft.com/en-us/azure/azure-monitor/overview" }],
  },
  "Cloud Monitoring": {
    category: "Google Cloud · Monitoring",
    definition:
      "Google Cloud Monitoring gathers metrics from Google Cloud services, VMs and applications, with Cloud Logging handling their logs. It offers dashboards, uptime checks and alerting policies. It also supports SLOs, so teams can track reliability against a target.",
    docs: [{ label: "Cloud Monitoring docs", url: "https://cloud.google.com/monitoring/docs" }],
  },
  PagerDuty: {
    category: "Incident response",
    definition:
      "PagerDuty is an incident management platform that routes alerts to the right on-call engineer. It manages on-call schedules and escalates an incident if no one responds in time. Alerts from tools such as Prometheus, CloudWatch and Datadog flow into it.",
    docs: [{ label: "PagerDuty docs", url: "https://support.pagerduty.com/" }],
  },
  "Vault / Key Vault": {
    category: "Security · Secrets management",
    definition:
      "HashiCorp Vault and Azure Key Vault store secrets such as passwords, API keys and certificates in one secured place. Applications fetch only the secrets they are allowed to, instead of keeping them in code or config files, and every access is logged. Vault can also issue short-lived credentials that expire on their own.",
    docs: [
      { label: "HashiCorp Vault", url: "https://developer.hashicorp.com/vault/docs" },
      { label: "Azure Key Vault", url: "https://learn.microsoft.com/en-us/azure/key-vault/general/overview" },
    ],
    aliases: ["Key Vault"],
  },
  GuardDuty: {
    category: "AWS · Threat detection",
    definition:
      "Amazon GuardDuty watches AWS accounts for malicious or unauthorised activity. It analyses CloudTrail events, VPC flow logs and DNS queries using threat intelligence and machine learning. Findings flag things like compromised credentials or crypto mining, with no agents to install.",
    docs: [{ label: "GuardDuty docs", url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html" }],
  },
  WAF: {
    category: "Security · Web application firewall",
    definition:
      "A web application firewall inspects HTTP requests before they reach an application. It blocks common attacks such as SQL injection and cross-site scripting, and can rate-limit abusive clients. AWS WAF, Azure WAF and Google Cloud Armor attach to load balancers and CDNs.",
    docs: [
      { label: "AWS WAF", url: "https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html" },
      { label: "Azure WAF", url: "https://learn.microsoft.com/en-us/azure/web-application-firewall/overview" },
      { label: "Cloud Armor", url: "https://cloud.google.com/armor/docs" },
    ],
  },
  "OPA / Kyverno": {
    category: "Security · Policy as code",
    definition:
      "Open Policy Agent and Kyverno enforce rules written as code, such as \"no containers run as root\". In Kubernetes they act as admission controllers that reject or fix resources that break a policy. OPA uses its own language, Rego, while Kyverno policies are plain Kubernetes YAML.",
    docs: [
      { label: "Open Policy Agent", url: "https://www.openpolicyagent.org/docs" },
      { label: "Kyverno", url: "https://kyverno.io/docs/" },
    ],
    aliases: ["OPA", "Kyverno"],
  },
  Trivy: {
    category: "Security · Vulnerability scanning",
    definition:
      "Trivy is an open-source scanner from Aqua Security. It finds known vulnerabilities, exposed secrets and misconfigurations in container images, file systems, infrastructure-as-code files and Kubernetes clusters. It runs in seconds, so it fits into a CI pipeline to block risky builds.",
    docs: [{ label: "Trivy docs", url: "https://trivy.dev/" }],
  },
  CIS: {
    category: "Security · Benchmarks",
    definition:
      "The Center for Internet Security publishes CIS Benchmarks, consensus guides for securely configuring operating systems, cloud accounts and Kubernetes. Each benchmark lists specific settings to check, such as disabling root login or turning on audit logging. Cloud security tools can score an environment against them automatically.",
    docs: [{ label: "CIS Benchmarks", url: "https://www.cisecurity.org/cis-benchmarks" }],
  },
  // ---- Stack: cloud platforms ----------------------------------------------
  RDS: {
    category: "AWS · Managed databases",
    definition:
      "Amazon RDS runs relational databases such as PostgreSQL, MySQL, MariaDB, Oracle and SQL Server as a managed service. AWS handles provisioning, patching, backups and failover to a standby in another availability zone. Read replicas spread read traffic, and storage can grow without downtime.",
    docs: [{ label: "Amazon RDS docs", url: "https://docs.aws.amazon.com/rds/" }],
  },
  ECS: {
    category: "AWS · Containers",
    definition:
      "Amazon ECS is AWS's own container orchestrator, a simpler alternative to Kubernetes. You describe containers in a task definition, and a service keeps the right number of tasks running behind a load balancer. Tasks run on EC2 instances you manage or on Fargate, with no servers at all.",
    docs: [{ label: "Amazon ECS docs", url: "https://docs.aws.amazon.com/ecs/" }],
  },
  "Route 53": {
    category: "AWS · DNS",
    definition:
      "Amazon Route 53 is AWS's managed DNS service and domain registrar. It answers DNS queries for your domains and can route users by latency, location or weighted splits. Health checks let it fail traffic over to a healthy endpoint automatically.",
    docs: [{ label: "Route 53 docs", url: "https://docs.aws.amazon.com/route53/" }],
  },
  CloudFront: {
    category: "AWS · Content delivery",
    definition:
      "Amazon CloudFront is a content delivery network that caches content at edge locations around the world. Users get pages, images and APIs from a nearby location, which cuts latency and load on the origin. It also terminates TLS and works with AWS WAF and Shield for protection.",
    docs: [{ label: "CloudFront docs", url: "https://docs.aws.amazon.com/cloudfront/" }],
  },
  KMS: {
    category: "AWS · Encryption",
    definition:
      "AWS Key Management Service creates and controls the keys used to encrypt data across AWS. Services such as S3, EBS and RDS call KMS to encrypt data at rest, and the keys never leave it unencrypted. Key policies and CloudTrail logs show exactly who can use each key and when it was used.",
    docs: [{ label: "AWS KMS docs", url: "https://docs.aws.amazon.com/kms/" }],
  },
  SNS: {
    category: "AWS · Messaging",
    definition:
      "Amazon SNS is a publish/subscribe service: a message sent to a topic is pushed to every subscriber. Subscribers can be SQS queues, Lambda functions, HTTP endpoints, email or SMS. It is often used to fan one event out to several services at once.",
    docs: [{ label: "Amazon SNS docs", url: "https://docs.aws.amazon.com/sns/" }],
  },
  "Azure Storage": {
    category: "Azure · Storage",
    definition:
      "An Azure Storage account is the container for Azure's core storage services: blobs, file shares, queues and tables. You choose how data is replicated, from within one data centre to across regions. Access is controlled with Entra ID roles, keys or time-limited shared access signatures.",
    docs: [
      { label: "Azure Storage intro", url: "https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction" },
    ],
  },
  "Azure Blob Storage": {
    category: "Azure · Object storage",
    definition:
      "Azure Blob Storage is Azure's object storage for unstructured data such as files, images, backups and logs. Hot, cool, cold and archive tiers trade access speed for lower cost. It plays the same role as Amazon S3 and Google Cloud Storage.",
    docs: [
      { label: "Blob Storage intro", url: "https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction" },
    ],
    aliases: ["Azure Blob", "Blob Storage"],
  },
  "Azure Functions": {
    category: "Azure · Serverless compute",
    definition:
      "Azure Functions runs small pieces of code in response to events, without managing servers. Triggers include HTTP requests, queue messages, timers and changes in storage or databases. It scales automatically, and on the consumption plan you pay only while code runs.",
    docs: [
      { label: "Azure Functions overview", url: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview" },
    ],
  },
  "Azure Policy": {
    category: "Azure · Governance",
    definition:
      "Azure Policy enforces rules on Azure resources, such as allowed regions, required tags or no public IP addresses. Policies can block non-compliant deployments, fix them automatically or just report them. A compliance dashboard shows which resources break which rules.",
    docs: [{ label: "Azure Policy overview", url: "https://learn.microsoft.com/en-us/azure/governance/policy/overview" }],
  },
  "Azure Blueprints": {
    category: "Azure · Governance",
    definition:
      "Azure Blueprints packaged role assignments, policies, resource groups and ARM templates into one repeatable definition for setting up compliant subscriptions. Assigning a blueprint stamped out a governed environment in a single step. Microsoft has deprecated it in favour of template specs and deployment stacks.",
    docs: [{ label: "Azure Blueprints", url: "https://learn.microsoft.com/en-us/azure/governance/blueprints/overview" }],
  },
  "Cosmos DB": {
    category: "Azure · NoSQL database",
    definition:
      "Azure Cosmos DB is a globally distributed NoSQL database with single-digit-millisecond reads and writes. Data can be replicated to any Azure region, with a choice of consistency levels. It offers several APIs, including its own NoSQL API and ones compatible with MongoDB and Cassandra.",
    docs: [{ label: "Cosmos DB intro", url: "https://learn.microsoft.com/en-us/azure/cosmos-db/introduction" }],
  },
  "GCP VPC": {
    category: "Google Cloud · Networking",
    definition:
      "A Google Cloud VPC is a private network for your Google Cloud resources. Unlike AWS and Azure, a single VPC is global: its subnets live in different regions but share one network without extra peering. Firewall rules and routes control traffic between VMs, GKE clusters and the internet.",
    docs: [{ label: "VPC overview", url: "https://cloud.google.com/vpc/docs/overview" }],
  },
  "Cloud Storage": {
    category: "Google Cloud · Object storage",
    definition:
      "Google Cloud Storage is object storage for files, backups, media and data lakes. Data lives in buckets, with Standard, Nearline, Coldline and Archive classes that trade access cost for storage price. It is Google Cloud's equivalent of Amazon S3.",
    docs: [{ label: "Cloud Storage docs", url: "https://cloud.google.com/storage/docs" }],
  },
  "Cloud SQL": {
    category: "Google Cloud · Managed databases",
    definition:
      "Cloud SQL is Google Cloud's managed service for PostgreSQL, MySQL and SQL Server. Google handles patching, backups, replication and failover. Applications connect with standard drivers, optionally through the Cloud SQL Auth Proxy for IAM-based access.",
    docs: [{ label: "Cloud SQL docs", url: "https://cloud.google.com/sql/docs" }],
  },
  "Cloud Functions": {
    category: "Google Cloud · Serverless compute",
    definition:
      "Google Cloud Functions runs single-purpose functions in response to HTTP requests or events such as Pub/Sub messages and Cloud Storage uploads. It scales automatically and bills only while code runs. Google has since folded it into Cloud Run as Cloud Run functions.",
    docs: [{ label: "Cloud Functions docs", url: "https://cloud.google.com/functions/docs" }],
  },
  "Cloud Run": {
    category: "Google Cloud · Serverless containers",
    definition:
      "Cloud Run runs any container image as a serverless service that scales with traffic, down to zero when idle. You deploy an image and get an HTTPS endpoint, with no cluster to manage. It suits web APIs, background jobs and event handlers.",
    docs: [{ label: "Cloud Run docs", url: "https://cloud.google.com/run/docs" }],
  },
  BigQuery: {
    category: "Google Cloud · Data warehouse",
    definition:
      "BigQuery is Google Cloud's serverless data warehouse for analysing very large datasets with SQL. Storage and compute are separate, so queries over terabytes run in seconds with no servers to size. It is often the destination for logs, billing exports and analytics data.",
    docs: [{ label: "BigQuery docs", url: "https://cloud.google.com/bigquery/docs" }],
  },
  "Cloud DNS": {
    category: "Google Cloud · DNS",
    definition:
      "Cloud DNS is Google Cloud's managed, highly available DNS service. It hosts public zones for your domains and private zones visible only inside your VPC networks. Records can be managed from the console, the gcloud CLI or Terraform.",
    docs: [{ label: "Cloud DNS docs", url: "https://cloud.google.com/dns/docs" }],
  },
  "Cloud CDN": {
    category: "Google Cloud · Content delivery",
    definition:
      "Cloud CDN caches content at Google's edge locations, close to users. It sits in front of Google Cloud's external load balancer and serves cached responses from VMs, Cloud Storage buckets or other backends. That cuts latency and the load on your servers.",
    docs: [{ label: "Cloud CDN docs", url: "https://cloud.google.com/cdn/docs" }],
  },
  "Multi-Cloud / Hybrid Cloud Strategy": {
    category: "Cloud architecture",
    definition:
      "Multi-cloud means running workloads on more than one public cloud, and hybrid cloud means combining a public cloud with your own data centres. The aim is to use each platform's strengths, avoid lock-in and meet data-residency or resilience needs. It takes portable tooling such as Terraform and Kubernetes, plus consistent identity, networking and monitoring across environments.",
  },
  "Cloud Networking": {
    category: "Cloud architecture",
    definition:
      "Cloud networking is how private networks in the cloud are laid out and connected: address ranges, subnets, routing and firewalls. It also covers linking those networks to each other and to on-premises sites. Good designs keep workloads isolated while letting the right services talk privately.",
  },
  "VPC Peering": {
    category: "Networking",
    definition:
      "VPC peering connects two private cloud networks so their resources can talk using private IP addresses. Traffic stays on the provider's backbone instead of the public internet. Peering isn't transitive, so larger designs use a hub such as Transit Gateway.",
    docs: [
      { label: "AWS VPC peering", url: "https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html" },
      { label: "Google Cloud VPC peering", url: "https://cloud.google.com/vpc/docs/vpc-peering" },
    ],
  },
  "Cloud Interconnect": {
    category: "Google Cloud · Hybrid networking",
    definition:
      "Cloud Interconnect is a private, high-bandwidth link between an on-premises network and Google Cloud. Dedicated Interconnect is a direct physical connection, while Partner Interconnect goes through a service provider. It is Google Cloud's counterpart to AWS Direct Connect and Azure ExpressRoute.",
    docs: [{ label: "Cloud Interconnect docs", url: "https://cloud.google.com/network-connectivity/docs/interconnect" }],
  },
  "Networking Fundamentals": {
    category: "Networking",
    definition:
      "Networking fundamentals are the core protocols every cloud system relies on: IP addressing and subnets, TCP and UDP, DNS, HTTP and TLS. Knowing them makes it possible to design networks and to debug why one service can't reach another. They apply the same way on every cloud and on-premises.",
  },
  DNS: {
    category: "Networking",
    definition:
      "The Domain Name System translates names like example.com into the IP addresses computers use to connect. Resolvers query a hierarchy of name servers and cache the answers for a set time to live. DNS records also route email, verify domain ownership and steer traffic between regions.",
    docs: [{ label: "What is DNS?", url: "https://www.cloudflare.com/learning/dns/what-is-dns/" }],
  },
  TLS: {
    category: "Networking · Security",
    definition:
      "Transport Layer Security encrypts data between a client and a server, which is the S in HTTPS. A certificate issued by a trusted authority proves the server is who it claims to be. Mutual TLS also verifies the client, which is common between services in a cluster.",
    docs: [
      { label: "What is TLS?", url: "https://www.cloudflare.com/learning/ssl/transport-layer-security-tls/" },
    ],
  },
  "Load Balancing": {
    category: "Networking",
    definition:
      "Load balancing spreads incoming traffic across several servers so no single one is overwhelmed. The load balancer checks each server's health and stops sending traffic to failed ones. Layer 4 balancers route by IP and port, while layer 7 balancers route by HTTP path, host or header.",
    docs: [
      { label: "What is load balancing?", url: "https://www.cloudflare.com/learning/performance/what-is-load-balancing/" },
    ],
  },

  // ---- Stack: infrastructure as code ----------------------------------------
  "Terraform / OpenTofu": {
    category: "Infrastructure as code",
    definition:
      "Terraform defines cloud infrastructure in declarative configuration files, then plans and applies the changes needed to match them. OpenTofu is an open-source fork of Terraform run by the Linux Foundation, created after HashiCorp changed Terraform's licence. Both use the same language and providers to manage AWS, Azure, GCP and more.",
    docs: [
      { label: "Terraform docs", url: "https://developer.hashicorp.com/terraform/docs" },
      { label: "OpenTofu docs", url: "https://opentofu.org/docs/" },
    ],
  },
  "Terraform Modules": {
    category: "Infrastructure as code · Terraform",
    definition:
      "A Terraform module is a reusable package of configuration, such as a standard network or Kubernetes cluster, with inputs and outputs. Teams build modules once and call them for each environment instead of copying code. Modules can be versioned and shared through a registry.",
    docs: [{ label: "Terraform modules", url: "https://developer.hashicorp.com/terraform/language/modules" }],
    aliases: ["Terraform / OpenTofu Modules"],
  },
  "Terraform State": {
    category: "Infrastructure as code · Terraform",
    definition:
      "Terraform's state file maps the resources in your configuration to the real resources in the cloud. Terraform compares it with your code to work out what to create, change or destroy. Teams keep it in a remote backend such as S3 or Azure Storage, with locking so two runs can't change it at once.",
    docs: [{ label: "Terraform state", url: "https://developer.hashicorp.com/terraform/language/state" }],
    aliases: ["Terraform / OpenTofu State"],
  },
  Terragrunt: {
    category: "Infrastructure as code · Terraform",
    definition:
      "Terragrunt is a thin wrapper around Terraform and OpenTofu that keeps configuration DRY across many environments and accounts. It generates backend and provider settings, and passes outputs between modules as dependencies. One command can plan or apply a whole stack of modules in the right order.",
    docs: [{ label: "Terragrunt docs", url: "https://terragrunt.gruntwork.io/docs/" }],
  },
  "CloudFormation / ARM / Bicep / Deployment Manager": {
    category: "Infrastructure as code",
    definition:
      "These are the native infrastructure-as-code tools of each cloud: CloudFormation for AWS, ARM templates and Bicep for Azure, and Deployment Manager for Google Cloud. Each takes a template describing resources and creates or updates them as one deployment. They are tightly integrated with their own cloud, where Terraform works across all of them.",
    docs: [
      { label: "CloudFormation", url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html" },
      { label: "Bicep", url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview" },
      { label: "ARM templates", url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview" },
      { label: "Deployment Manager", url: "https://cloud.google.com/deployment-manager/docs" },
    ],
  },
  "AWS CDK / Pulumi / Crossplane": {
    category: "Infrastructure as code",
    definition:
      "The AWS CDK and Pulumi let you define infrastructure in general-purpose languages such as TypeScript, Python or Go, with loops, functions and tests. Crossplane takes a different approach, managing cloud resources as Kubernetes objects that controllers keep in sync. All three add abstraction on top of plain templates.",
    docs: [
      { label: "AWS CDK", url: "https://docs.aws.amazon.com/cdk/v2/guide/home.html" },
      { label: "Pulumi", url: "https://www.pulumi.com/docs/" },
      { label: "Crossplane", url: "https://docs.crossplane.io/" },
    ],
  },
  "Golden Images": {
    category: "Machine images",
    definition:
      "A golden image is a pre-built, hardened machine image with the operating system, patches and standard software already installed. Every new server starts from it, so instances are identical and boot ready to work. Images are rebuilt on a schedule, often with Packer, to pick up security updates.",
    docs: [{ label: "Packer docs", url: "https://developer.hashicorp.com/packer/docs" }],
    aliases: ["Packer Golden Images"],
  },
  "Ansible Playbooks": {
    category: "Configuration management · Ansible",
    definition:
      "An Ansible playbook is a YAML file listing the tasks to run on a group of hosts, in order. Each task calls a module, such as installing a package or templating a config file. Playbooks are idempotent, so running one again only changes what has drifted.",
    docs: [{ label: "Playbook guide", url: "https://docs.ansible.com/ansible/latest/playbook_guide/index.html" }],
  },
  "Ansible Roles": {
    category: "Configuration management · Ansible",
    definition:
      "An Ansible role bundles the tasks, templates, files and default variables for one job, such as setting up nginx. Playbooks apply roles to hosts instead of repeating tasks. Roles can be shared and reused through Ansible Galaxy.",
    docs: [
      { label: "Ansible roles", url: "https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html" },
    ],
  },
  GitOps: {
    category: "Continuous delivery",
    definition:
      "GitOps uses a Git repository as the single source of truth for what should be running. An agent in the cluster, such as Argo CD or Flux, pulls the desired state from Git and continuously reconciles the cluster to match. Every change is a reviewed commit, so it is audited and easy to roll back.",
    docs: [{ label: "OpenGitOps principles", url: "https://opengitops.dev/" }],
  },
  Flux: {
    category: "GitOps · Continuous delivery",
    definition:
      "Flux is a CNCF GitOps tool that keeps Kubernetes clusters in sync with configuration stored in Git. It applies plain manifests, Kustomize overlays and Helm charts, and can update image tags automatically. Like Argo CD, it corrects drift so the cluster always matches the repository.",
    docs: [{ label: "Flux docs", url: "https://fluxcd.io/flux/" }],
  },
  "IaC Scanning": {
    category: "Security · Infrastructure as code",
    definition:
      "IaC scanning checks Terraform, CloudFormation, Kubernetes manifests and similar files for security misconfigurations before they are deployed. Typical findings are public storage buckets, open security groups or missing encryption. Running scanners in CI catches these problems at review time rather than in production.",
  },
  Checkov: {
    category: "Security · IaC scanning",
    definition:
      "Checkov is an open-source static analysis tool for infrastructure-as-code from Prisma Cloud. It scans Terraform, CloudFormation, Kubernetes, Helm and Dockerfiles against hundreds of built-in policies. Custom policies can be written in Python or YAML.",
    docs: [{ label: "Checkov docs", url: "https://www.checkov.io/" }],
  },
  tfsec: {
    category: "Security · IaC scanning",
    definition:
      "tfsec is an open-source static analysis scanner for Terraform code from Aqua Security. It flags insecure settings such as unencrypted storage or overly open firewall rules, with links to how to fix them. Its checks now live on inside Trivy, which Aqua recommends instead.",
    docs: [{ label: "tfsec on GitHub", url: "https://github.com/aquasecurity/tfsec" }],
  },

  // ---- Stack: CI/CD ---------------------------------------------------------
  "Pipelines as Code": {
    category: "CI/CD",
    definition:
      "Pipelines as code means defining build and deployment pipelines in files stored with the application, such as a Jenkinsfile. Changes to the pipeline are reviewed and versioned like any other code. Every branch can carry its own pipeline, and history shows exactly what changed.",
    docs: [{ label: "Jenkins Pipeline", url: "https://www.jenkins.io/doc/book/pipeline/" }],
    aliases: ["Jenkins Pipelines as Code"],
  },
  "GitLab CI / Azure DevOps Pipelines": {
    category: "CI/CD",
    definition:
      "GitLab CI/CD and Azure Pipelines are the built-in pipeline services of GitLab and Azure DevOps. Pipelines are defined in YAML in the repository and run jobs in stages on hosted or self-hosted runners. Both cover building, testing and deploying to any cloud.",
    docs: [
      { label: "GitLab CI/CD", url: "https://docs.gitlab.com/ci/" },
      { label: "Azure Pipelines", url: "https://learn.microsoft.com/en-us/azure/devops/pipelines/" },
    ],
  },
  "AWS CodePipeline + CodeBuild / Google Cloud Build": {
    category: "CI/CD · Cloud-native",
    definition:
      "AWS CodePipeline orchestrates release stages, while CodeBuild runs the actual build and test steps in managed containers. Google Cloud Build does both on Google Cloud, running build steps defined in a YAML file. Being native, they integrate directly with each cloud's IAM, registries and deployment targets.",
    docs: [
      { label: "CodePipeline", url: "https://docs.aws.amazon.com/codepipeline/" },
      { label: "CodeBuild", url: "https://docs.aws.amazon.com/codebuild/" },
      { label: "Cloud Build", url: "https://cloud.google.com/build/docs" },
    ],
  },
  "Tekton / Harness": {
    category: "CI/CD",
    definition:
      "Tekton is an open-source framework for building CI/CD pipelines as Kubernetes resources, with each step running in a container. Harness is a commercial delivery platform with pipelines, automatic verification of deployments and rollback. Both are used to standardise delivery across many teams.",
    docs: [
      { label: "Tekton docs", url: "https://tekton.dev/docs/" },
      { label: "Harness docs", url: "https://developer.harness.io/docs/" },
    ],
  },
  "Progressive Delivery": {
    category: "Continuous delivery",
    definition:
      "Progressive delivery releases a new version to a small share of users first, then widens it as metrics stay healthy. Common techniques are canary releases, blue-green deployments and feature flags. If error rates or latency rise, the rollout stops and rolls back automatically.",
  },
  "Argo Rollouts": {
    category: "Kubernetes · Progressive delivery",
    definition:
      "Argo Rollouts is a Kubernetes controller that adds canary and blue-green deployments. It shifts traffic to a new version in steps, through an ingress controller or a service mesh. Analysis runs check metrics from tools like Prometheus at each step and roll back if they fail.",
    docs: [{ label: "Argo Rollouts docs", url: "https://argo-rollouts.readthedocs.io/en/stable/" }],
  },
  "Artifact Management": {
    category: "CI/CD",
    definition:
      "Artifact management is storing the outputs of builds, such as container images, packages and binaries, in versioned repositories. Deployments pull a known, tested artifact instead of rebuilding it. Registries also control access, keep history and scan artifacts for vulnerabilities.",
  },
  Nexus: {
    category: "CI/CD · Artifact repository",
    definition:
      "Sonatype Nexus Repository is a self-hosted repository manager for build artifacts. It stores and proxies Maven, npm, PyPI, NuGet, Docker and many other formats in one place. Caching public packages speeds up builds and keeps them working if an upstream registry goes down.",
    docs: [{ label: "Nexus Repository", url: "https://www.sonatype.com/products/sonatype-nexus-repository" }],
  },

  // ---- Stack: containers ----------------------------------------------------
  "Docker Best Practices": {
    category: "Containers · Docker",
    definition:
      "Dockerfile best practices keep images small, fast to build and secure. Multi-stage builds leave compilers out of the final image, minimal base images reduce attack surface, and ordering layers well makes caching effective. Containers should also run as a non-root user with pinned versions.",
    docs: [{ label: "Docker best practices", url: "https://docs.docker.com/build/building/best-practices/" }],
  },
  hadolint: {
    category: "Containers · Linting",
    definition:
      "hadolint is a linter for Dockerfiles. It checks each instruction against best-practice rules, such as pinning package versions and avoiding the latest tag, and also lints shell commands in RUN lines. It is quick to add as a step in CI.",
    docs: [{ label: "hadolint on GitHub", url: "https://github.com/hadolint/hadolint" }],
  },
  Kustomize: {
    category: "Kubernetes · Configuration",
    definition:
      "Kustomize customises Kubernetes manifests without templates. A base set of manifests is patched by overlays for each environment, such as a different replica count in production. It is built into kubectl with the -k flag.",
    docs: [
      { label: "Kustomize in Kubernetes", url: "https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/" },
    ],
  },
  "Kubernetes Deployments": {
    category: "Kubernetes · Workloads",
    definition:
      "A Kubernetes Deployment declares how many copies of a pod should run and which image they use. Kubernetes keeps that number running, replacing pods that fail. Changing the image triggers a rolling update, and a bad release can be rolled back.",
    docs: [{ label: "Deployments", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" }],
  },
  "Kubernetes Services": {
    category: "Kubernetes · Networking",
    definition:
      "A Kubernetes Service gives a set of pods one stable name and IP address, even as the pods behind it come and go. It load-balances traffic across the healthy pods it selects by label. Types such as ClusterIP, NodePort and LoadBalancer control whether it is reachable inside the cluster or from outside.",
    docs: [{ label: "Services", url: "https://kubernetes.io/docs/concepts/services-networking/service/" }],
  },
  Autoscaling: {
    category: "Kubernetes · Scaling",
    definition:
      "Autoscaling adjusts capacity to match demand automatically. In Kubernetes, the Horizontal Pod Autoscaler adds or removes pods based on metrics like CPU, and node autoscalers add or remove the machines they run on. Scaling down when quiet saves money, and scaling up keeps services responsive under load.",
    docs: [
      { label: "Horizontal Pod Autoscaler", url: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/" },
    ],
  },
  Karpenter: {
    category: "Kubernetes · Node autoscaling",
    definition:
      "Karpenter is an open-source node autoscaler for Kubernetes, created by AWS. When pods can't be scheduled, it launches right-sized nodes in seconds, choosing instance types to fit. It also consolidates workloads onto fewer, cheaper nodes when demand drops.",
    docs: [{ label: "Karpenter docs", url: "https://karpenter.sh/docs/" }],
  },
  KEDA: {
    category: "Kubernetes · Event-driven autoscaling",
    definition:
      "KEDA (Kubernetes Event-driven Autoscaling) scales workloads based on event sources rather than just CPU. It can scale on queue length, stream lag, database queries and many other metrics, including down to zero. It works alongside the standard Horizontal Pod Autoscaler.",
    docs: [{ label: "KEDA docs", url: "https://keda.sh/docs/" }],
  },
  "Service Mesh": {
    category: "Kubernetes · Networking",
    definition:
      "A service mesh is an infrastructure layer that handles communication between services, usually through a proxy alongside each one. It adds mutual TLS, retries, timeouts and traffic splitting without changing application code. It also gives consistent metrics and traces for every call between services.",
  },
  "Container Security": {
    category: "Security · Containers",
    definition:
      "Container security covers the whole life of a container: scanning images for vulnerabilities, using minimal and signed images, and running them with least privilege. At runtime, tools watch for suspicious behaviour such as a shell opening inside a container. Kubernetes settings such as network policies and pod security standards limit the damage if one is compromised.",
  },
  Falco: {
    category: "Security · Runtime detection",
    definition:
      "Falco is a CNCF runtime security tool that watches system calls on hosts and containers. Rules flag suspicious activity, such as a shell spawning in a container or a sensitive file being read. Alerts can be sent to chat, SIEMs or automated responses.",
    docs: [{ label: "Falco docs", url: "https://falco.org/docs/" }],
  },

  // ---- Stack: monitoring ----------------------------------------------------
  "Prometheus + Grafana": {
    category: "Monitoring",
    definition:
      "Prometheus collects and stores metrics from applications and infrastructure, and fires alerts from rules written in PromQL. Grafana turns those metrics into dashboards that show system health at a glance. Together they are the most common open-source monitoring stack, especially on Kubernetes.",
    docs: [
      { label: "Prometheus", url: "https://prometheus.io/docs/introduction/overview/" },
      { label: "Grafana", url: "https://grafana.com/docs/grafana/latest/" },
    ],
  },
  "CloudWatch + Azure Monitor + Google Cloud Monitoring": {
    category: "Monitoring · Cloud-native",
    definition:
      "These are the built-in monitoring services of AWS, Azure and Google Cloud. Each collects metrics and logs from its own services automatically, with dashboards and alerting on top. They are the first place to look for cloud resource health, often alongside a cross-cloud tool such as Grafana or Datadog.",
    docs: [
      { label: "CloudWatch", url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html" },
      { label: "Azure Monitor", url: "https://learn.microsoft.com/en-us/azure/azure-monitor/overview" },
      { label: "Cloud Monitoring", url: "https://cloud.google.com/monitoring/docs" },
    ],
  },
  "OpenTelemetry + Jaeger": {
    category: "Observability · Tracing",
    definition:
      "OpenTelemetry instruments applications to emit traces, metrics and logs in a vendor-neutral format. Jaeger is an open-source tracing backend that stores those traces and shows how a request flows through each service. Together they pinpoint which service in a chain is slow or failing.",
    docs: [
      { label: "OpenTelemetry", url: "https://opentelemetry.io/docs/" },
      { label: "Jaeger", url: "https://www.jaegertracing.io/docs/" },
    ],
  },
  "Load Testing": {
    category: "Performance testing",
    definition:
      "Load testing simulates many users hitting a system at once to see how it behaves under pressure. It finds the point where response times climb or errors start, before real users do. Results guide capacity planning, autoscaling settings and performance fixes.",
  },
  k6: {
    category: "Performance testing",
    definition:
      "Grafana k6 is an open-source load-testing tool where tests are written in JavaScript. It simulates virtual users, measures response times and error rates, and fails a test if thresholds are breached. It runs from a laptop, in CI or as a distributed cloud test.",
    docs: [{ label: "k6 docs", url: "https://grafana.com/docs/k6/latest/" }],
  },
  Alerting: {
    category: "Monitoring · Incident response",
    definition:
      "Alerting notifies people when a system needs attention, based on rules over metrics, logs or health checks. Good alerts fire on symptoms users would notice, such as errors or latency, rather than every small blip. Alerts are routed to the right on-call person and escalated if no one responds.",
  },
  Opsgenie: {
    category: "Incident response",
    definition:
      "Opsgenie is Atlassian's alerting and on-call management service. It receives alerts from monitoring tools, works out who is on call and notifies them by app, SMS or phone, escalating if needed. Atlassian is moving its features into Jira Service Management and Compass.",
    docs: [{ label: "Opsgenie docs", url: "https://support.atlassian.com/opsgenie/" }],
  },
  "SLOs / Error Budgets": {
    category: "Site reliability engineering",
    definition:
      "A service level objective is a target for reliability, such as 99.9% of requests succeeding over 30 days. The error budget is the failure that target still allows, here 0.1% of requests. When the budget runs low, teams slow releases and focus on reliability, so the trade-off is based on data.",
    docs: [
      { label: "Google SRE: SLOs", url: "https://sre.google/sre-book/service-level-objectives/" },
      { label: "Error budget policy", url: "https://sre.google/workbook/error-budget-policy/" },
    ],
  },

  // ---- Stack: security ------------------------------------------------------
  "Secrets Management": {
    category: "Security",
    definition:
      "Secrets management keeps passwords, API keys and certificates out of code and config files. Secrets live in a dedicated, encrypted store, and applications fetch them at runtime with their own identity. Access is logged, and secrets can be rotated without redeploying.",
  },
  "Secret Manager": {
    category: "Google Cloud · Secrets",
    definition:
      "Google Cloud Secret Manager stores API keys, passwords and certificates as versioned secrets. Access is granted per secret through IAM and every access is logged. Applications on GKE, Cloud Run or Compute Engine read secrets at runtime instead of keeping them in code.",
    docs: [{ label: "Secret Manager docs", url: "https://cloud.google.com/secret-manager/docs" }],
  },
  "Infrastructure Security": {
    category: "Security",
    definition:
      "Infrastructure security protects the cloud environment itself: networks, accounts, workloads and data. It combines preventive controls, such as firewalls and least-privilege access, with detection services that spot threats and misconfigurations. Findings are fed to a team or an automated response.",
  },
  "Security Command Center": {
    category: "Google Cloud · Security",
    definition:
      "Security Command Center is Google Cloud's central security and risk dashboard. It finds misconfigurations, vulnerabilities and active threats across projects, and ranks them by risk. It plays a similar role to AWS Security Hub and Microsoft Defender for Cloud.",
    docs: [{ label: "Security Command Center", url: "https://cloud.google.com/security-command-center/docs" }],
  },
  "Cloud Armor": {
    category: "Google Cloud · Security",
    definition:
      "Google Cloud Armor protects applications behind Google's load balancers from DDoS attacks and web exploits. It includes preconfigured web application firewall rules for attacks such as SQL injection and cross-site scripting. Rate limiting and IP or geography rules block abusive traffic at the edge.",
    docs: [{ label: "Cloud Armor docs", url: "https://cloud.google.com/armor/docs" }],
  },
  "Policy as Code": {
    category: "Security · Governance",
    definition:
      "Policy as code writes security and compliance rules as code that is versioned, tested and enforced automatically. The same rules can check infrastructure code in CI and block non-compliant resources from being created. That replaces manual reviews with fast, consistent checks.",
  },
  Compliance: {
    category: "Security · Governance",
    definition:
      "Compliance means meeting the security and privacy requirements set by standards, laws and customers. In the cloud, that means mapping controls such as encryption, access reviews and logging to frameworks like CIS and SOC 2. Automated checks and audit trails provide the evidence.",
  },
  "SOC 2": {
    category: "Security · Compliance",
    definition:
      "SOC 2 is an audit framework from the AICPA for how a service provider protects customer data. It assesses controls under five trust services criteria: security, availability, processing integrity, confidentiality and privacy. A Type II report shows the controls worked over a period of months.",
  },
  "Dependency & Secret Scanning": {
    category: "Security · Software supply chain",
    definition:
      "Dependency scanning checks the open-source libraries an application uses for known vulnerabilities and outdated versions. Secret scanning searches code and history for leaked passwords, keys and tokens. Running both in CI and on pull requests stops problems before they merge.",
  },
  Snyk: {
    category: "Security · Software supply chain",
    definition:
      "Snyk is a developer security platform that finds vulnerabilities in open-source dependencies, container images, infrastructure code and your own code. It integrates with IDEs, Git repositories and CI. It can open pull requests that upgrade a vulnerable package to a fixed version.",
    docs: [{ label: "Snyk docs", url: "https://docs.snyk.io/" }],
  },
  Dependabot: {
    category: "Security · Dependencies",
    definition:
      "Dependabot is built into GitHub and keeps dependencies up to date. It alerts on dependencies with known vulnerabilities and opens pull requests to upgrade them. It can also open routine version-update pull requests on a schedule.",
    docs: [{ label: "Dependabot docs", url: "https://docs.github.com/en/code-security/dependabot" }],
  },
  Gitleaks: {
    category: "Security · Secret scanning",
    definition:
      "Gitleaks is an open-source tool that scans Git repositories for hard-coded secrets such as API keys, passwords and tokens. It checks the full commit history as well as new changes. It is usually run as a pre-commit hook or in CI to stop secrets being pushed.",
    docs: [{ label: "Gitleaks on GitHub", url: "https://github.com/gitleaks/gitleaks" }],
  },
  "SAST / DAST / Code Quality": {
    category: "Security · Application testing",
    definition:
      "Static application security testing (SAST) analyses source code for vulnerabilities without running it. Dynamic testing (DAST) attacks the running application from outside, the way a real attacker would. Code-quality tools add checks for bugs, code smells and test coverage, often as a gate in CI.",
  },
  SonarQube: {
    category: "Code quality · SAST",
    definition:
      "SonarQube continuously inspects code for bugs, vulnerabilities and code smells in dozens of languages. A quality gate can fail a pull request if new code doesn't meet the bar, such as minimum test coverage. Results appear in its dashboard and as comments on pull requests.",
    docs: [{ label: "SonarQube", url: "https://www.sonarsource.com/products/sonarqube/" }],
  },
  "OIDC Federation": {
    category: "Security · Identity",
    definition:
      "OIDC federation lets a cloud account trust tokens from an outside identity provider, such as GitHub Actions or GitLab. A CI job proves who it is with a short-lived token and assumes a cloud role for just that job. No long-lived access keys are stored in the pipeline, so there is nothing to leak or rotate.",
    docs: [
      {
        label: "GitHub Actions OIDC",
        url: "https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect",
      },
      {
        label: "AWS OIDC providers",
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html",
      },
    ],
    aliases: ["Keyless CI/CD Auth"],
  },

  // ---- Stack: scripting and others ------------------------------------------
  "Python / Bash / PowerShell / Makefile": {
    category: "Scripting and automation",
    definition:
      "These are the everyday automation languages of DevOps work. Python handles larger tools and API integrations, Bash and PowerShell script the Linux and Windows command line, and Makefiles give a project short, repeatable commands. Together they glue builds, deployments and operations tasks into one-step commands.",
    docs: [
      { label: "Python", url: "https://docs.python.org/3/" },
      { label: "PowerShell", url: "https://learn.microsoft.com/en-us/powershell/" },
      { label: "GNU Make", url: "https://www.gnu.org/software/make/manual/" },
    ],
  },
  "Advanced Git": {
    category: "Version control",
    definition:
      "Advanced Git goes beyond commit and push to rebasing, cherry-picking, bisecting to find a bad commit and recovering lost work with the reflog. It also covers branching strategies such as trunk-based development, and keeping history clean for review. These skills make collaboration and debugging much faster.",
    docs: [{ label: "Pro Git book", url: "https://git-scm.com/book/en/v2" }],
  },
  "Agile + DevOps Culture": {
    category: "Ways of working",
    definition:
      "Agile delivers software in short iterations with frequent feedback, rather than one large release. DevOps culture brings development and operations together, sharing ownership of building, shipping and running services. Automation, small changes and blameless reviews help teams release often and safely.",
  },
  "FinOps & Cost Optimization": {
    category: "Cloud cost management",
    definition:
      "FinOps is the practice of making engineering, finance and business teams jointly accountable for cloud spending. Cost optimization uses tagging, budgets and alerts, rightsizing, reserved or spot capacity, and shutting down idle resources. The goal is to get the most value from every dollar, not just spend less.",
    docs: [{ label: "What is FinOps?", url: "https://www.finops.org/introduction/what-is-finops/" }],
  },
  "Disaster Recovery & Backup": {
    category: "Reliability",
    definition:
      "Disaster recovery is the plan for restoring service after a major failure, such as losing a region or corrupted data. It is designed around two targets: how much data you can afford to lose (RPO) and how long you can be down (RTO). Regular, tested backups and failover drills prove the plan actually works.",
  },
  "Chaos Engineering": {
    category: "Reliability",
    definition:
      "Chaos engineering deliberately injects failures, such as killing pods, adding network latency or dropping a dependency, to see how a system copes. Experiments start small with a clear hypothesis and a way to stop them. Weaknesses are found and fixed before they cause a real outage.",
    docs: [{ label: "Principles of Chaos", url: "https://principlesofchaos.org/" }],
  },
  "Chaos Mesh": {
    category: "Reliability · Chaos engineering",
    definition:
      "Chaos Mesh is a CNCF chaos engineering platform for Kubernetes. Experiments are Kubernetes resources that inject pod failures, network delays, stress and other faults. A dashboard schedules and monitors experiments across the cluster.",
    docs: [{ label: "Chaos Mesh docs", url: "https://chaos-mesh.org/docs/" }],
  },
  Litmus: {
    category: "Reliability · Chaos engineering",
    definition:
      "LitmusChaos is a CNCF chaos engineering framework for Kubernetes and cloud infrastructure. It provides a hub of ready-made experiments and lets you chain them into workflows. Probes check that the system stays healthy while each experiment runs.",
    docs: [{ label: "Litmus docs", url: "https://docs.litmuschaos.io/" }],
  },
  "Platform Engineering": {
    category: "Developer experience",
    definition:
      "Platform engineering builds an internal developer platform: self-service tools, templates and paved paths that let teams ship without needing deep infrastructure knowledge. The platform team treats other developers as its customers. Common pieces are a service catalogue, golden-path templates and automated environments.",
  },
  Backstage: {
    category: "Developer portal",
    definition:
      "Backstage is an open-source framework for building developer portals, created at Spotify and now a CNCF project. Its software catalogue tracks every service, its owner and its docs in one place. Templates let developers create a new service with pipelines and infrastructure already set up.",
    docs: [{ label: "Backstage docs", url: "https://backstage.io/docs/overview/what-is-backstage" }],
  },
  "Incident Response & Runbooks": {
    category: "Reliability · Operations",
    definition:
      "Incident response is the process for detecting, coordinating and resolving outages, with clear roles such as an incident commander. Runbooks are step-by-step guides for diagnosing and fixing known problems, so anyone on call can act quickly. Blameless reviews afterwards turn each incident into lasting fixes.",
    docs: [{ label: "Google SRE: incidents", url: "https://sre.google/sre-book/managing-incidents/" }],
  },
  "Go / Java": {
    category: "Programming languages",
    definition:
      "Go is a simple, compiled language from Google that produces single static binaries, which is why much cloud-native tooling, including Docker, Kubernetes and Terraform, is written in it. Java is a mature, widely used language that runs on the JVM. Both are used for CLI tools, operators and internal services.",
    docs: [
      { label: "Go docs", url: "https://go.dev/doc/" },
      { label: "Learn Java", url: "https://dev.java/learn/" },
    ],
    aliases: ["Go / Java for tooling"],
  },

  // ---- Stack: full-stack development ----------------------------------------
  "JavaScript / TypeScript": {
    category: "Programming languages · Web",
    definition:
      "JavaScript is the language of the web, running in every browser and, through Node.js, on servers. TypeScript adds static types on top of JavaScript and compiles to plain JavaScript. The types catch mistakes before code runs and make large codebases easier to change.",
    docs: [
      { label: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
      { label: "TypeScript docs", url: "https://www.typescriptlang.org/docs/" },
    ],
  },
  "React / Angular": {
    category: "Front-end frameworks",
    definition:
      "React is a library for building user interfaces from components, and Angular is a complete framework from Google with routing, forms and dependency injection built in. Both build single-page applications that update the page without full reloads. React is more flexible, while Angular is more opinionated.",
    docs: [
      { label: "React docs", url: "https://react.dev/" },
      { label: "Angular docs", url: "https://angular.dev/" },
    ],
  },
  "Node.js / Express": {
    category: "JavaScript · Back end",
    definition:
      "Node.js runs JavaScript on the server, with non-blocking I/O that handles many connections at once. Express is a minimal web framework for Node that maps routes to handlers through a chain of middleware. Together they are a common way to build REST APIs in JavaScript.",
    docs: [
      { label: "Node.js docs", url: "https://nodejs.org/docs/latest/api/" },
      { label: "Express docs", url: "https://expressjs.com/" },
    ],
  },
  "Spring Boot": {
    category: "Java · Web framework",
    definition:
      "Spring Boot is a framework for building production-ready Java applications and REST APIs quickly. Auto-configuration and starter dependencies remove most setup, and an embedded server means the app runs as a single JAR. Built-in health checks and metrics make it a good fit for microservices.",
    docs: [{ label: "Spring Boot docs", url: "https://docs.spring.io/spring-boot/" }],
  },
  "RESTful APIs": {
    category: "Web APIs",
    definition:
      "A RESTful API exposes resources at URLs and uses standard HTTP methods to act on them: GET to read, POST to create, PUT or PATCH to update, DELETE to remove. Responses use status codes and usually JSON. Because each request is stateless, the API is simple to cache, scale and consume from any client.",
    docs: [{ label: "MDN: REST", url: "https://developer.mozilla.org/en-US/docs/Glossary/REST" }],
  },
  Microservices: {
    category: "Software architecture",
    definition:
      "Microservices split an application into small, independent services, each owning one business capability and its own data. Services talk over APIs or events and can be deployed and scaled separately. That speeds up teams but adds operational work, such as monitoring and network reliability.",
    docs: [{ label: "Martin Fowler: Microservices", url: "https://martinfowler.com/articles/microservices.html" }],
  },
  "Event-Driven Architecture": {
    category: "Software architecture",
    definition:
      "In an event-driven architecture, services announce that something happened, such as an order being placed, and other services react to it. Events flow through a broker such as SQS, EventBridge, Pub/Sub or Kafka. Producers don't need to know who consumes their events, so services stay loosely coupled and can scale independently.",
    docs: [
      { label: "Martin Fowler: event-driven", url: "https://martinfowler.com/articles/201701-event-driven.html" },
    ],
  },

  "Python / FastAPI": {
    category: "Python · Back end",
    definition:
      "Python is a readable, general-purpose language used for web back ends, automation and data work. FastAPI is a modern Python framework that uses type hints to validate requests and generate OpenAPI docs automatically. Together they make it quick to build fast, well-documented REST APIs.",
    docs: [
      { label: "Python docs", url: "https://docs.python.org/3/" },
      { label: "FastAPI docs", url: "https://fastapi.tiangolo.com/" },
    ],
  },
  "End-to-End Testing": {
    category: "Testing",
    definition:
      "End-to-end tests check a whole application the way a user experiences it, from the browser through the API to the database. They click, type and assert on what appears on the page. Running them in CI catches broken user journeys that unit tests miss.",
  },

  // ---- Stack: group names added with the extra tools ------------------------
  "Release & Workflow Orchestration": {
    category: "Continuous delivery",
    definition:
      "Release orchestration coordinates deployments across many environments, with approvals, schedules and promotion from staging to production. Workflow orchestration runs multi-step jobs, such as data pipelines or batch tasks, as a graph of steps with retries. Both turn complex, manual runbooks into repeatable automated processes.",
  },
  "Cluster Networking": {
    category: "Kubernetes · Networking",
    definition:
      "Cluster networking gives every Kubernetes pod an IP address and lets pods reach each other across nodes. It is provided by a CNI plugin, such as Cilium or Calico, chosen when the cluster is built. Network policies on top of it control which pods are allowed to talk to which.",
  },
  "Observability Platforms": {
    category: "Observability",
    definition:
      "Observability platforms bring metrics, logs, traces and alerts together in one hosted product. They save teams from running and scaling their own monitoring stack, and connect data across services so problems can be traced to a cause. Datadog, New Relic and Splunk are among the most widely used.",
  },
  "Error Tracking": {
    category: "Observability",
    definition:
      "Error tracking captures exceptions and crashes from applications as they happen, with the stack trace and the context around them. Similar errors are grouped, counted and linked to the release that introduced them. Developers get alerted and can see exactly which line broke for which users.",
  },
  "Cloud Security Posture": {
    category: "Security · Cloud",
    definition:
      "Cloud security posture management continuously scans cloud accounts for misconfigurations and risks, such as public buckets, unencrypted databases or overly broad permissions. Findings are prioritised by how exposed and exploitable they are. Tools map results to frameworks like CIS and SOC 2 and track them across AWS, Azure and GCP.",
  },
  "Supply Chain Security": {
    category: "Security · Software supply chain",
    definition:
      "Software supply chain security protects everything that goes into a build, from dependencies and base images to the CI pipeline itself. Practices include generating a software bill of materials (SBOM), scanning it for vulnerabilities and signing artifacts. Deployments can then verify that an image is the one the pipeline actually built.",
  },
  "Databases & Caching": {
    category: "Data",
    definition:
      "Applications store data in relational databases, such as PostgreSQL, MySQL and SQL Server, or in NoSQL stores, such as MongoDB, chosen to fit how the data is read and written. A cache like Redis keeps hot data in memory to cut response times and database load. Schema design, indexing and backups matter as much as the choice of engine.",
  },
  Messaging: {
    category: "Software architecture",
    definition:
      "Messaging systems let services communicate asynchronously by passing messages through a broker instead of calling each other directly. Queues spread work across consumers, while streams keep an ordered log of events that many services can replay. That decouples services and absorbs spikes in load.",
  },

  // ---- Marquee and Stack: extra cloud services -----------------------------
  Aurora: {
    category: "AWS · Managed databases",
    definition:
      "Amazon Aurora is a cloud-native relational database compatible with MySQL and PostgreSQL. Its storage is spread across three availability zones and grows automatically, which gives fast failover and high throughput. Aurora Serverless can scale capacity up and down with demand.",
    docs: [
      { label: "Aurora docs", url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html" },
    ],
  },
  ElastiCache: {
    category: "AWS · Caching",
    definition:
      "Amazon ElastiCache runs in-memory caches, compatible with Redis, Valkey and Memcached, as a managed service. Applications keep frequently read data in it to get sub-millisecond responses and take load off their databases. AWS handles patching, replication and failover.",
    docs: [{ label: "ElastiCache docs", url: "https://docs.aws.amazon.com/elasticache/" }],
  },
  Fargate: {
    category: "AWS · Serverless containers",
    definition:
      "AWS Fargate runs containers for ECS and EKS without you managing any servers. You specify the CPU and memory for each task or pod, and AWS provides isolated compute for it. You pay for those resources only while the containers run.",
    docs: [{ label: "Fargate docs", url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html" }],
  },
  "API Gateway": {
    category: "AWS · APIs",
    definition:
      "Amazon API Gateway creates, publishes and secures REST, HTTP and WebSocket APIs at any scale. It routes requests to Lambda functions, containers or other services, and handles authentication, throttling and caching. It is the usual front door for serverless back ends on AWS.",
    docs: [{ label: "API Gateway docs", url: "https://docs.aws.amazon.com/apigateway/" }],
  },
  "Step Functions": {
    category: "AWS · Workflow orchestration",
    definition:
      "AWS Step Functions coordinates multi-step workflows as a visual state machine. Each step can call Lambda or another AWS service, with built-in retries, error handling, branches and parallel runs. It keeps long-running processes reliable without writing your own orchestration code.",
    docs: [{ label: "Step Functions docs", url: "https://docs.aws.amazon.com/step-functions/" }],
  },
  EventBridge: {
    category: "AWS · Events",
    definition:
      "Amazon EventBridge is a serverless event bus that routes events from AWS services, your applications and SaaS tools to targets based on rules. Targets include Lambda, SQS, Step Functions and many more. Its scheduler also runs tasks on a cron schedule.",
    docs: [{ label: "EventBridge docs", url: "https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html" }],
  },
  "AWS Organizations": {
    category: "AWS · Governance",
    definition:
      "AWS Organizations manages many AWS accounts centrally, grouped into organisational units. Service control policies set guardrails on what any account can do, and billing is consolidated into one bill. Using separate accounts per team or environment limits the blast radius of mistakes.",
    docs: [{ label: "Organizations docs", url: "https://docs.aws.amazon.com/organizations/" }],
  },
  "Control Tower": {
    category: "AWS · Governance",
    definition:
      "AWS Control Tower sets up and governs a secure multi-account AWS environment, called a landing zone. It builds on AWS Organizations to create accounts from a standard blueprint with logging and security already in place. Controls flag or prevent changes that break best practice.",
    docs: [{ label: "Control Tower docs", url: "https://docs.aws.amazon.com/controltower/" }],
  },
  AKS: {
    category: "Azure · Managed Kubernetes",
    definition:
      "Azure Kubernetes Service runs the Kubernetes control plane for you on Azure, at no charge for the control plane on the free tier. You manage node pools of virtual machines, which can scale automatically. It integrates with Entra ID for access, Azure networking and Azure Monitor.",
    docs: [{ label: "AKS docs", url: "https://learn.microsoft.com/en-us/azure/aks/" }],
  },
  GKE: {
    category: "Google Cloud · Managed Kubernetes",
    definition:
      "Google Kubernetes Engine is Google Cloud's managed Kubernetes, from the company that created Kubernetes. Google runs the control plane and can also manage the nodes for you in Autopilot mode. It handles upgrades, scaling and repairs automatically.",
    docs: [{ label: "GKE docs", url: "https://cloud.google.com/kubernetes-engine/docs" }],
  },
  Cloudflare: {
    category: "Edge network",
    definition:
      "Cloudflare runs a global edge network that sits in front of websites and APIs. It provides DNS, a CDN, DDoS protection and a web application firewall, plus Workers for running code at the edge. Traffic is filtered and cached close to users before it reaches your servers.",
    docs: [{ label: "Cloudflare docs", url: "https://developers.cloudflare.com/" }],
  },
  Linux: {
    category: "Operating systems",
    definition:
      "Linux is the open-source operating system that runs most cloud servers and every container. Administering it means managing users and permissions, packages, services with systemd, storage and networking from the command line. Knowing it well is the base for troubleshooting almost anything in the cloud.",
  },
  Nginx: {
    category: "Web server · Reverse proxy",
    definition:
      "Nginx is a fast, lightweight web server that is widely used as a reverse proxy and load balancer. It terminates TLS, serves static files and forwards requests to application servers. In Kubernetes, the NGINX ingress controller routes outside traffic to services.",
    docs: [{ label: "Nginx docs", url: "https://nginx.org/en/docs/" }],
  },
  Envoy: {
    category: "Networking · Proxy",
    definition:
      "Envoy is a high-performance open-source proxy built for cloud-native applications and a CNCF project. It handles load balancing, retries, TLS and detailed metrics for traffic between services. It is the data plane inside Istio and many API gateways.",
    docs: [{ label: "Envoy docs", url: "https://www.envoyproxy.io/docs" }],
  },

  // ---- Marquee and Stack: extra infrastructure as code ----------------------
  "ARM Templates": {
    category: "Azure · Infrastructure as code",
    definition:
      "Azure Resource Manager templates are JSON files that declare the Azure resources to deploy. Azure Resource Manager reads the template and creates or updates everything in one deployment. Bicep is a simpler language that compiles down to ARM templates.",
    docs: [
      { label: "ARM templates", url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview" },
    ],
  },
  "Deployment Manager": {
    category: "Google Cloud · Infrastructure as code",
    definition:
      "Google Cloud Deployment Manager creates Google Cloud resources from YAML configurations, with Jinja or Python templates for reuse. A deployment is updated as a whole when the configuration changes. Google now steers new work towards Terraform and its Infrastructure Manager service.",
    docs: [{ label: "Deployment Manager", url: "https://cloud.google.com/deployment-manager/docs" }],
  },
  "AWS CDK": {
    category: "AWS · Infrastructure as code",
    definition:
      "The AWS Cloud Development Kit defines AWS infrastructure in TypeScript, Python, Java, C# or Go. High-level constructs set up a whole pattern, such as a load-balanced container service, in a few lines. The CDK turns the code into CloudFormation templates and deploys them.",
    docs: [{ label: "AWS CDK guide", url: "https://docs.aws.amazon.com/cdk/v2/guide/home.html" }],
  },
  Pulumi: {
    category: "Infrastructure as code",
    definition:
      "Pulumi defines cloud infrastructure in general-purpose languages such as TypeScript, Python, Go and C#. You get loops, functions, packages and unit tests, while Pulumi works out what to create, update or delete. It supports AWS, Azure, GCP, Kubernetes and many other providers.",
    docs: [{ label: "Pulumi docs", url: "https://www.pulumi.com/docs/" }],
  },
  Crossplane: {
    category: "Kubernetes · Infrastructure as code",
    definition:
      "Crossplane is a CNCF project that manages cloud resources, such as databases and buckets, as Kubernetes objects. Controllers keep the real resources in sync with what is declared, and fix drift automatically. Platform teams use compositions to offer simple, self-service APIs on top.",
    docs: [{ label: "Crossplane docs", url: "https://docs.crossplane.io/" }],
  },

  // ---- Marquee and Stack: extra containers and Kubernetes -------------------
  "cert-manager": {
    category: "Kubernetes · TLS certificates",
    definition:
      "cert-manager automates TLS certificates in Kubernetes. It requests certificates from issuers such as Let's Encrypt or a private CA, stores them as secrets and renews them before they expire. Ingresses and services then always have valid HTTPS.",
    docs: [{ label: "cert-manager docs", url: "https://cert-manager.io/docs/" }],
  },
  Linkerd: {
    category: "Kubernetes · Service mesh",
    definition:
      "Linkerd is a lightweight CNCF service mesh for Kubernetes. It adds automatic mutual TLS, retries and golden metrics such as success rate and latency to every service. It aims to be simpler and lighter to run than Istio.",
    docs: [{ label: "Linkerd", url: "https://linkerd.io/" }],
  },
  Consul: {
    category: "Service networking",
    definition:
      "HashiCorp Consul provides service discovery, health checking and a service mesh across Kubernetes, virtual machines and clouds. Services register themselves and find each other by name. Its mesh adds mutual TLS and rules about which services may talk.",
    docs: [{ label: "Consul docs", url: "https://developer.hashicorp.com/consul/docs" }],
  },
  Cilium: {
    category: "Kubernetes · Networking",
    definition:
      "Cilium is a CNCF networking, security and observability layer for Kubernetes built on eBPF in the Linux kernel. It connects pods, enforces network policies down to HTTP level and can replace kube-proxy for faster load balancing. Its Hubble tool shows the traffic flowing between services.",
    docs: [{ label: "Cilium docs", url: "https://docs.cilium.io/" }],
  },
  Velero: {
    category: "Kubernetes · Backup",
    definition:
      "Velero backs up and restores Kubernetes cluster resources and persistent volumes. Backups go to object storage such as S3 and can run on a schedule. It is used for disaster recovery and for migrating workloads between clusters.",
    docs: [{ label: "Velero docs", url: "https://velero.io/docs/" }],
  },

  // ---- Marquee and Stack: extra delivery ------------------------------------
  "Argo Workflows": {
    category: "Kubernetes · Workflow orchestration",
    definition:
      "Argo Workflows is a CNCF workflow engine that runs multi-step jobs on Kubernetes, with each step in its own container. Steps can run in sequence, in parallel or as a dependency graph. It is used for CI pipelines, data processing and machine learning jobs.",
    docs: [{ label: "Argo Workflows docs", url: "https://argo-workflows.readthedocs.io/en/latest/" }],
  },
  Spinnaker: {
    category: "Continuous delivery",
    definition:
      "Spinnaker is an open-source, multi-cloud continuous delivery platform created at Netflix. Pipelines deploy to Kubernetes and the major clouds using strategies such as blue-green and canary. Automated canary analysis compares the new version's metrics with the old before promoting it.",
    docs: [{ label: "Spinnaker docs", url: "https://spinnaker.io/docs/" }],
  },
  "Octopus Deploy": {
    category: "Release orchestration",
    definition:
      "Octopus Deploy automates releases and promotes them through environments such as dev, test and production. It manages variables per environment, approvals and runbooks for operations tasks. It deploys to Kubernetes, cloud services, VMs and on-premises servers.",
    docs: [{ label: "Octopus docs", url: "https://octopus.com/docs" }],
  },
  "Azure DevOps": {
    category: "CI/CD · Dev platform",
    definition:
      "Azure DevOps is Microsoft's suite for planning, building and shipping software. It includes Boards for work tracking, Repos for Git, Pipelines for CI/CD, Test Plans and Artifacts for packages. Pipelines can build and deploy to any cloud, not just Azure.",
    docs: [{ label: "Azure DevOps docs", url: "https://learn.microsoft.com/en-us/azure/devops/" }],
  },
  CodePipeline: {
    category: "AWS · CI/CD",
    definition:
      "AWS CodePipeline models a release as a series of stages, such as source, build, test and deploy, and runs them on every change. Each stage can use AWS services or third-party tools. Manual approval steps can gate deployment to production.",
    docs: [{ label: "CodePipeline docs", url: "https://docs.aws.amazon.com/codepipeline/" }],
  },
  CodeBuild: {
    category: "AWS · CI/CD",
    definition:
      "AWS CodeBuild is a managed build service that compiles code, runs tests and produces artifacts. Build steps are defined in a buildspec file and run in fresh containers that scale automatically. You pay by the minute, with no build servers to maintain.",
    docs: [{ label: "CodeBuild docs", url: "https://docs.aws.amazon.com/codebuild/" }],
  },
  "Cloud Build": {
    category: "Google Cloud · CI/CD",
    definition:
      "Google Cloud Build runs builds as a series of steps, each in its own container, defined in a YAML file. It can build images, run tests and deploy to GKE, Cloud Run and other targets. Triggers start builds from pushes to GitHub, GitLab or other repositories.",
    docs: [{ label: "Cloud Build docs", url: "https://cloud.google.com/build/docs" }],
  },
  Tekton: {
    category: "Kubernetes · CI/CD",
    definition:
      "Tekton is an open-source framework for building CI/CD pipelines as Kubernetes resources. Tasks and pipelines are defined in YAML and each step runs in a container on the cluster. Being a set of building blocks, it is often used to build in-house delivery platforms.",
    docs: [{ label: "Tekton docs", url: "https://tekton.dev/docs/" }],
  },
  Harness: {
    category: "CI/CD · Delivery platform",
    definition:
      "Harness is a commercial software delivery platform covering CI, CD, feature flags and cloud cost management. Its deployment pipelines can verify a release against monitoring data and roll back automatically. Templates and policies help standardise delivery across many teams.",
    docs: [{ label: "Harness docs", url: "https://developer.harness.io/docs/" }],
  },

  // ---- Marquee and Stack: extra monitoring ----------------------------------
  Thanos: {
    category: "Monitoring · Prometheus",
    definition:
      "Thanos extends Prometheus with long-term storage and a global view across many clusters. It stores metrics cheaply in object storage and deduplicates data from highly available Prometheus pairs. One query can then cover every cluster and months of history.",
    docs: [{ label: "Thanos", url: "https://thanos.io/" }],
  },
  Tempo: {
    category: "Observability · Tracing",
    definition:
      "Grafana Tempo is an open-source distributed tracing backend that stores traces cheaply in object storage. It accepts OpenTelemetry, Jaeger and Zipkin data. In Grafana, traces link to the related metrics and logs.",
    docs: [{ label: "Tempo docs", url: "https://grafana.com/docs/tempo/latest/" }],
  },
  Elasticsearch: {
    category: "Search · Log analytics",
    definition:
      "Elasticsearch is a distributed search and analytics engine that indexes data for fast full-text search. In the ELK stack it stores and searches logs, and it also powers site search and analytics. Data is spread across nodes in shards so it scales out.",
    docs: [{ label: "Elasticsearch", url: "https://www.elastic.co/elasticsearch" }],
  },
  Kibana: {
    category: "Observability · Dashboards",
    definition:
      "Kibana is the web interface of the Elastic Stack. It searches and visualises data stored in Elasticsearch, such as logs and metrics, with dashboards and charts. Teams use it to investigate incidents and set up alerts.",
    docs: [{ label: "Kibana", url: "https://www.elastic.co/kibana" }],
  },
  "New Relic": {
    category: "Observability platform",
    definition:
      "New Relic is a hosted observability platform for application performance monitoring, infrastructure, logs and browser monitoring. Agents and OpenTelemetry send data into one store, queried with its NRQL language. Dashboards and alerts show how code changes affect performance.",
    docs: [{ label: "New Relic docs", url: "https://docs.newrelic.com/" }],
  },
  Splunk: {
    category: "Observability · Security analytics",
    definition:
      "Splunk collects, indexes and searches machine data such as logs and events at large scale. Its search language powers dashboards, alerts and investigations for operations and security teams. Splunk is now part of Cisco.",
    docs: [{ label: "Splunk", url: "https://www.splunk.com/" }],
  },
  Sentry: {
    category: "Error tracking",
    definition:
      "Sentry captures errors and performance problems from web, mobile and back-end applications. Each error comes with its stack trace, the release it appeared in and the steps that led to it. Alerts and issue tracking help developers fix the most frequent problems first.",
    docs: [{ label: "Sentry docs", url: "https://docs.sentry.io/" }],
  },

  // ---- Marquee and Stack: extra security ------------------------------------
  "External Secrets": {
    category: "Kubernetes · Secrets",
    definition:
      "External Secrets Operator syncs secrets from stores such as AWS Secrets Manager, Azure Key Vault, Google Secret Manager and Vault into Kubernetes. Applications read ordinary Kubernetes secrets while the source of truth stays in the external store. Rotated values are picked up automatically.",
    docs: [{ label: "External Secrets", url: "https://external-secrets.io/" }],
  },
  SOPS: {
    category: "Security · Secrets",
    definition:
      "SOPS encrypts the values in YAML, JSON and env files while leaving the keys readable. Encryption keys can come from AWS KMS, Azure Key Vault, Google Cloud KMS or age. That makes it safe to keep secrets in Git, which suits GitOps.",
    docs: [{ label: "SOPS", url: "https://getsops.io/" }],
  },
  Wiz: {
    category: "Security · Cloud security platform",
    definition:
      "Wiz is a cloud security platform that scans AWS, Azure, GCP and Kubernetes without installing agents. It builds a graph of resources, identities, vulnerabilities and network exposure. It then highlights the combinations that create real attack paths.",
    docs: [{ label: "Wiz", url: "https://www.wiz.io/" }],
  },
  "Prisma Cloud": {
    category: "Security · Cloud security platform",
    definition:
      "Prisma Cloud is Palo Alto Networks' platform for securing cloud applications from code to runtime. It covers posture management, workload and container protection, and infrastructure-as-code scanning. Checkov, the open-source IaC scanner, comes from the same team.",
    docs: [{ label: "Prisma Cloud", url: "https://www.paloaltonetworks.com/prisma/cloud" }],
  },
  Cosign: {
    category: "Security · Supply chain",
    definition:
      "Cosign, part of the Sigstore project, signs and verifies container images and other artifacts. Keyless signing ties a signature to a CI identity through OIDC, with no long-lived keys to manage. Clusters can then refuse to run images that aren't signed.",
    docs: [{ label: "Sigstore docs", url: "https://docs.sigstore.dev/" }],
  },
  Syft: {
    category: "Security · SBOM",
    definition:
      "Syft is an open-source tool from Anchore that generates a software bill of materials (SBOM) from container images and file systems. It lists every package and library inside, in standard formats such as SPDX and CycloneDX. That inventory feeds vulnerability scanners and compliance checks.",
    docs: [{ label: "Syft on GitHub", url: "https://github.com/anchore/syft" }],
  },
  Grype: {
    category: "Security · Vulnerability scanning",
    definition:
      "Grype is an open-source vulnerability scanner from Anchore for container images, file systems and SBOMs. It matches packages against known vulnerability databases and reports their severity and fixes. It pairs with Syft and fits easily into CI.",
    docs: [{ label: "Grype on GitHub", url: "https://github.com/anchore/grype" }],
  },
  Semgrep: {
    category: "Security · SAST",
    definition:
      "Semgrep is a fast static analysis tool that finds bugs and security issues using rules that look like the code they match. It supports many languages and comes with large community rule sets. Teams also write custom rules to enforce their own standards in CI.",
    docs: [{ label: "Semgrep docs", url: "https://semgrep.dev/docs/" }],
  },
  "OWASP ZAP": {
    category: "Security · DAST",
    definition:
      "ZAP, the Zed Attack Proxy, is a free dynamic application security testing tool, originally an OWASP project. It crawls a running web app and probes it for vulnerabilities such as injection and cross-site scripting. Its baseline scan runs easily in CI against a test deployment.",
    docs: [{ label: "ZAP docs", url: "https://www.zaproxy.org/docs/" }],
  },

  // ---- Marquee and Stack: ways of working -----------------------------------
  Jira: {
    category: "Project tracking",
    definition:
      "Jira is Atlassian's tool for planning and tracking work as issues on Scrum and Kanban boards. Teams use it to manage backlogs, sprints, bugs and releases. It links to code, pull requests and deployments for full traceability.",
    docs: [{ label: "Jira docs", url: "https://support.atlassian.com/jira-software-cloud/" }],
  },
  Confluence: {
    category: "Documentation",
    definition:
      "Confluence is Atlassian's team wiki for documentation, runbooks, design docs and meeting notes. Pages are organised in spaces and can embed Jira issues and diagrams. It is where many teams keep their architecture decisions and operational knowledge.",
    docs: [{ label: "Confluence docs", url: "https://support.atlassian.com/confluence-cloud/" }],
  },

  // ---- Marquee and Stack: extra languages, app development and data ---------
  PowerShell: {
    category: "Scripting",
    definition:
      "PowerShell is Microsoft's cross-platform shell and scripting language. Unlike text-based shells, it passes structured objects between commands. It is the standard way to automate Windows and Azure administration.",
    docs: [{ label: "PowerShell docs", url: "https://learn.microsoft.com/en-us/powershell/" }],
  },
  Make: {
    category: "Build automation",
    definition:
      "Make runs tasks defined in a Makefile, rebuilding only what has changed since the last run. In DevOps projects a Makefile gives everyone the same short commands, such as make test or make deploy. It is preinstalled on most Linux and macOS systems.",
    docs: [{ label: "GNU Make manual", url: "https://www.gnu.org/software/make/manual/" }],
  },
  Java: {
    category: "Programming languages",
    definition:
      "Java is a mature, strongly typed language that runs on the Java Virtual Machine on any platform. It is widely used for enterprise back ends, often with Spring Boot, and for big-data tools. Its large ecosystem includes build tools like Maven and Gradle.",
    docs: [{ label: "Learn Java", url: "https://dev.java/learn/" }],
  },
  JavaScript: {
    category: "Programming languages · Web",
    definition:
      "JavaScript is the programming language of the web, running in every browser to make pages interactive. With Node.js it also runs on servers and in command-line tools. It has the largest package ecosystem of any language, through npm.",
    docs: [{ label: "MDN JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" }],
  },
  "Next.js": {
    category: "React · Web framework",
    definition:
      "Next.js is a React framework from Vercel for building full web applications. It adds file-based routing, server-side rendering, static generation and API routes on top of React. Pages can be pre-rendered for speed and SEO, then become interactive in the browser.",
    docs: [{ label: "Next.js docs", url: "https://nextjs.org/docs" }],
  },
  Angular: {
    category: "Front-end framework",
    definition:
      "Angular is Google's full front-end framework, written in TypeScript. It includes routing, forms, HTTP and dependency injection out of the box. Its consistent structure suits large enterprise applications.",
    docs: [{ label: "Angular docs", url: "https://angular.dev/" }],
  },
  GraphQL: {
    category: "Web APIs",
    definition:
      "GraphQL is a query language for APIs where the client asks for exactly the fields it needs in a single request. A typed schema describes all the data the API offers. That avoids over-fetching and the many round trips a REST client can need.",
    docs: [{ label: "Learn GraphQL", url: "https://graphql.org/learn/" }],
  },
  Postman: {
    category: "API tooling",
    definition:
      "Postman is a platform for designing, testing and documenting APIs. You build and send requests, save them in collections and write tests against the responses. Collections can run in CI with the Postman CLI to check APIs automatically.",
    docs: [{ label: "Postman docs", url: "https://learning.postman.com/docs/" }],
  },
  MySQL: {
    category: "Relational database",
    definition:
      "MySQL is one of the most popular open-source relational databases, now owned by Oracle. It is fast and simple to run, and powers many web applications. Every major cloud offers it as a managed service, such as Amazon RDS and Aurora.",
    docs: [{ label: "MySQL docs", url: "https://dev.mysql.com/doc/" }],
  },
  "SQL Server": {
    category: "Relational database",
    definition:
      "Microsoft SQL Server is a relational database widely used in enterprise and Windows environments. It includes reporting, integration and analytics services alongside the database engine. In Azure it is available as Azure SQL Database and SQL Managed Instance.",
    docs: [{ label: "SQL Server docs", url: "https://learn.microsoft.com/en-us/sql/sql-server/" }],
  },
  MongoDB: {
    category: "NoSQL database",
    definition:
      "MongoDB is a document database that stores data as flexible JSON-like documents rather than rows in tables. Documents in a collection don't need the same fields, so the schema can evolve easily. MongoDB Atlas runs it as a managed service on AWS, Azure and GCP.",
    docs: [{ label: "MongoDB docs", url: "https://www.mongodb.com/docs/" }],
  },
  Redis: {
    category: "In-memory data store",
    definition:
      "Redis is an in-memory data store used as a cache, session store, message broker and fast database. It supports rich data structures such as hashes, lists, sets and sorted sets. Because data lives in memory, reads and writes take well under a millisecond.",
    docs: [{ label: "Redis docs", url: "https://redis.io/docs/" }],
  },
  Kafka: {
    category: "Event streaming",
    definition:
      "Apache Kafka is a distributed event streaming platform that stores streams of events in durable, ordered, partitioned logs. Many services can read the same events at their own pace and replay them later. It is used for event-driven architectures, data pipelines and real-time analytics.",
    docs: [{ label: "Kafka docs", url: "https://kafka.apache.org/documentation/" }],
  },
  RabbitMQ: {
    category: "Message broker",
    definition:
      "RabbitMQ is a widely used open-source message broker. Producers publish messages to exchanges, which route them to queues by rules, and consumers process them. It suits task queues and service-to-service messaging that need flexible routing.",
    docs: [{ label: "RabbitMQ docs", url: "https://www.rabbitmq.com/docs" }],
  },

  // ---- Marquee: single tools from the combined Stack entries ---------------
  OpenTofu: {
    category: "Infrastructure as code",
    definition:
      "OpenTofu is an open-source fork of Terraform, run by the Linux Foundation after HashiCorp changed Terraform's licence. It uses the same configuration language, providers and state, so most Terraform code runs unchanged. It also adds features of its own, such as encrypting state files.",
    docs: [{ label: "OpenTofu docs", url: "https://opentofu.org/docs/" }],
  },
  "GitLab CI": {
    category: "CI/CD",
    definition:
      "GitLab CI/CD is the pipeline service built into GitLab. Pipelines are defined in a .gitlab-ci.yml file in the repository and run jobs in stages on GitLab-hosted or self-hosted runners. It covers building, testing, security scanning and deploying from the same place the code lives.",
    docs: [{ label: "GitLab CI/CD docs", url: "https://docs.gitlab.com/ci/" }],
  },
  Loki: {
    category: "Observability · Logs",
    definition:
      "Grafana Loki is a log aggregation system designed to be cheap to run. It indexes only labels, such as the app and environment, rather than the full log text, and stores the logs compressed in object storage. Logs are queried with LogQL and shown in Grafana next to metrics.",
    docs: [{ label: "Loki docs", url: "https://grafana.com/docs/loki/latest/" }],
  },
  Jaeger: {
    category: "Observability · Tracing",
    definition:
      "Jaeger is an open-source distributed tracing system and a CNCF project. It collects traces, often sent through OpenTelemetry, and shows how a single request moves through each service. That makes it easy to see which service in a chain is slow or failing.",
    docs: [{ label: "Jaeger docs", url: "https://www.jaegertracing.io/docs/" }],
  },
  Python: {
    category: "Programming languages",
    definition:
      "Python is a readable, general-purpose programming language with a huge standard library and package ecosystem. In cloud and DevOps work it is used for automation scripts, CLI tools, AWS Lambda functions and web APIs. Cloud SDKs such as boto3 make every cloud service scriptable from Python.",
    docs: [{ label: "Python docs", url: "https://docs.python.org/3/" }],
  },
  Go: {
    category: "Programming languages",
    definition:
      "Go is a simple, compiled language from Google with built-in concurrency. It builds fast, single static binaries that are easy to ship in containers. Much of the cloud-native ecosystem, including Docker, Kubernetes, Terraform and Prometheus, is written in Go.",
    docs: [{ label: "Go docs", url: "https://go.dev/doc/" }],
  },
  TypeScript: {
    category: "Programming languages · Web",
    definition:
      "TypeScript is JavaScript with static types, created by Microsoft. The compiler catches type errors before code runs and then outputs plain JavaScript. Editors use the types for autocompletion and safe refactoring, which helps most on large codebases.",
    docs: [{ label: "TypeScript docs", url: "https://www.typescriptlang.org/docs/" }],
  },

  "Operating Systems": {
    category: "Computer science",
    definition:
      "Operating systems manage a computer's hardware and give programs a safe, shared environment to run in. The coursework covers processes and threads, scheduling, memory management and file systems. These ideas underpin how containers, virtual machines and cloud servers actually behave.",
  },
  Networking: {
    category: "Computer science",
    definition:
      "Networking is how computers exchange data, from physical links up through protocols like IP, TCP and HTTP. The coursework covers how packets are addressed, routed and delivered reliably across the internet. It is the basis for designing cloud networks, load balancers and secure connections.",
  },
  Algorithms: {
    category: "Computer science",
    definition:
      "Algorithms are step-by-step methods for solving problems, such as sorting, searching and finding paths in graphs. The coursework pairs them with data structures and analyses how their time and memory grow with input size. Choosing the right one is what keeps software fast as data grows.",
  },
  Cryptography: {
    category: "Computer science",
    definition:
      "Cryptography is the science of keeping data secret and trustworthy. It covers encryption, hashing, digital signatures and key exchange. These are what make TLS, secrets management and secure authentication possible.",
  },
  "Software Engineering": {
    category: "Computer science",
    definition:
      "Software engineering is the discipline of building software that works, lasts and can be maintained by a team. It covers requirements, design, testing, version control and development processes such as Agile. The aim is reliable software delivered predictably, not just code that runs once.",
  },
  Databases: {
    category: "Computer science",
    definition:
      "Database coursework covers how data is modelled, stored and queried. It includes relational design and normalisation, SQL, indexing and transactions. Those foundations apply to everything from PostgreSQL to managed cloud databases.",
  },
  "Cloud Computing": {
    category: "Computer science",
    definition:
      "Cloud computing delivers compute, storage and networking on demand over the internet, paid for as you use it. The coursework covers virtualisation, service models such as IaaS, PaaS and SaaS, and designing for scale and failure. It is the foundation for working with AWS, Azure and Google Cloud.",
  },
  "Machine Learning": {
    category: "Computer science",
    definition:
      "Machine learning builds models that learn patterns from data instead of following hand-written rules. The coursework covers supervised and unsupervised learning, training and evaluation. Those models power things like recommendations, forecasting and language tools.",
  },
};

// Looks a tag up by its exact text or an alias.
export function lookup(tag: string): { key: string; term: Term } | undefined {
  if (glossary[tag]) return { key: tag, term: glossary[tag] };
  for (const [key, term] of Object.entries(glossary)) {
    if (term.aliases?.includes(tag)) return { key, term };
  }
  return undefined;
}
