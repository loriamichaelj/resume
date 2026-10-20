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
    aliases: ["EventBridge / SQS"],
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
