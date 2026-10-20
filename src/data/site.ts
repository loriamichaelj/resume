// -----------------------------------------------------------------------------
// Single source of truth for all site content.
// Edit values here; components read from this file.
// -----------------------------------------------------------------------------

export const profile = {
  name: "Michael J. Loria",
  firstName: "Michael",
  role: "Cloud DevOps & Full-Stack Engineer",
  // Short headline used in the hero.
  headline:
    "I design, build, test, automate, secure and operate production grade multi cloud systems alongside robust, scalable and resilient containerized deployments using devops principles.",
  // Slightly longer bio for the About section.
  bio: "Cloud engineer with expertise in AWS, Azure and GCP. I manage cloud infrastructure and develop full-stack software. Today I focus on designing multi-cloud infrastructure and building the full-stack apps that run on it.",
  location: "",
  // Set to "" to hide the email call-to-action.
  email: "mikejloria@gmail.com",
  resumeUrl: "", // optional: link to a downloadable PDF in /public
};

// Rotating line under the name in the hero: "<prefix> <word> <suffix>".
export const heroRotator = {
  prefix: "Building",
  words: ["secure", "resilient", "automated", "scalable", "observable"],
  suffix: "cloud platforms.",
};

// Short tool names for the scrolling band under the hero.
export const marquee: string[] = [
  "AWS",
  "Azure",
  "GCP",
  "Terraform",
  "Kubernetes",
  "Docker",
  "Helm",
  "ArgoCD",
  "GitHub Actions",
  "Packer",
  "Ansible",
  "Prometheus",
  "Grafana",
  "OpenTelemetry",
  "Datadog",
  "Vault",
  "Istio",
  "FastAPI",
  "React",
  "PostgreSQL",
];

export type Social = {
  label: string;
  href: string;
  // key maps to an inline SVG icon in the Icon component.
  icon: "github" | "email" | "twitter";
};

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/loriamichaelj", icon: "github" },
  { label: "X", href: "https://x.com/0xloria", icon: "twitter" },
  { label: "Email", href: "mailto:mikejloria@gmail.com", icon: "email" },
];

export type Certification = {
  name: string;
  code: string;
  status: string;
};

export const certifications: Certification[] = [
  {
    name: "Azure Fundamentals",
    code: "AZ-900",
    status: "Microsoft Certified",
  },
  {
    name: "AWS Certified Cloud Practitioner",
    code: "CLF-C02",
    status: "AWS Certified",
  },
];

export type Experience = {
  org: string;
  role: string;
  location?: string;
  // Optional dates, shown under the badge (e.g. "2018 – 2022").
  period?: string;
  kind: "project" | "work" | "education";
  // Optional repository link, shown on project entries.
  link?: string;
  points: string[];
  tags?: string[];
};

export const experience: Experience[] = [
  {
    org: "ShipTrack",
    role: "Multi-cloud migration from EC2 to Kubernetes",
    kind: "project",
    link: "https://github.com/loriamichaelj/shiptrack-platform",
    points: [
      "Planned and ran a cloud migration of a FastAPI shipment-tracking app from EC2 hosts to EKS across four repositories, assessing sixteen anti-patterns and choosing replatform, refactor, retain, or retire for each using the 7 Rs.",
      "Moved traffic in waves by changing weighted ALB rules through pull requests, with a stack header on every response so a misrouted test fails. Rolling back is changing the weights back, and the legacy stack stays up as the fallback.",
      "Took the same container image to AKS and to GKE Autopilot with Cloud SQL, Pub/Sub, and Workload Identity, using a cloud seam in the app and per-cloud Terraform.",
      "Applied every infrastructure change through GitHub Actions over OIDC with a reviewer approving each apply, and a CI scrub that fails any pull request that commits an account ID or secret.",
    ],
    tags: ["Terraform", "EKS / AKS / GKE", "ALB", "RDS PostgreSQL", "SQS / EventBridge", "Pub/Sub", "GitHub Actions", "FastAPI"],
  },
  {
    org: "CloudPunks",
    role: "Event-driven microservices marketplace on AWS EKS",
    kind: "project",
    link: "https://github.com/loriamichaelj/cloud-punks",
    points: [
      "Built a marketplace for 100 pixel-art characters as four microservices (product, inventory, order, and notification) behind a gateway, with a React UI and FastAPI services.",
      "Connected the services through asynchronous events on EventBridge and SQS, using a transactional outbox so an order moves from pending to confirmed or rejected while inventory transfers ownership. Lambdas send low-stock and activity emails through SES.",
      "Gave each service its own store (PostgreSQL, DynamoDB, and a Valkey cache), and provisioned the AWS environment with Terraform.",
      "Ran the full system three ways: Docker Compose with LocalStack and no AWS account, a local Kubernetes cluster, and AWS EKS built and operated only by GitHub Actions.",
    ],
    tags: ["EKS", "Terraform", "EventBridge / SQS", "Lambda", "DynamoDB", "RDS PostgreSQL", "GitHub Actions", "FastAPI", "React"],
  },
  {
    org: "Beacon",
    role: "Three-tier incident tracker on AWS EC2",
    kind: "project",
    link: "https://github.com/loriamichaelj/beacon",
    points: [
      "Built a service and incident tracking app with a FastAPI REST API, a React and TypeScript UI, and PostgreSQL, including an overview dashboard and a timeline on every incident.",
      "Provisioned AWS with Terraform: a shared VPC with VPC endpoints and no NAT gateway, an Application Load Balancer, an Auto Scaling Group, and RDS PostgreSQL, running on a Packer-built base AMI with the CloudWatch Agent.",
      "Automated delivery with GitHub Actions over OIDC (test, build, database migration, rolling instance refresh, and smoke tests), plus rollback to any commit, drilled with zero downtime.",
    ],
    tags: ["Terraform", "EC2 / Auto Scaling", "ALB", "RDS PostgreSQL", "Packer", "GitHub Actions", "FastAPI", "React"],
  },
  {
    org: "DORA Deployment Tracker",
    role: "Software delivery metrics platform",
    kind: "project",
    link: "https://github.com/loriamichaelj/dora",
    points: [
      "Built a three-tier app that records deployments, the commits they ship, and the failures they cause, and computes the five DORA software delivery metrics from that data.",
      "Containerized the React, FastAPI, and PostgreSQL tiers with Docker Compose, using health-check-gated startup, least-privilege database roles, structured JSON logs, and Prometheus metrics.",
      "Exposed an idempotent ingest API that CI pipelines call to report deployments. The app records its own builds through the same API.",
    ],
    tags: ["FastAPI", "React", "PostgreSQL", "Docker Compose", "Prometheus", "Playwright"],
  },
  {
    org: "AWS CI/CD Framework",
    role: "Reusable multi-environment release pipeline",
    kind: "project",
    link: "https://github.com/loriamichaelj/aws-cicd-framework",
    points: [
      "Built a reusable GitHub Actions deploy workflow that consumer repositories call by version tag, with dev, stage, and prod each building from their own branch behind required-reviewer approval.",
      "Replaced long-lived AWS keys with GitHub OIDC federation. The deploy role trusts only approved environment identities, so an unapproved job cannot assume it.",
      "Enforced container release discipline with multi-stage builds, non-root users, pinned base images, hadolint linting, and immutable SHA-tagged images, backed by a Terraform spec for the supporting AWS resources.",
    ],
    tags: ["GitHub Actions", "Docker", "AWS IAM (OIDC)", "Terraform", "S3"],
  },
  {
    org: "Azure Hub-and-Spoke Network",
    role: "Azure networking lab",
    kind: "project",
    link: "https://github.com/loriamichaelj/azure-hub-spoke",
    points: [
      "Deployed a three-VNet hub-and-spoke topology entirely from Azure CLI scripts, peering each spoke to the hub with no route between spokes so workloads stay isolated.",
      "Locked down access with subnet-level NSGs: SSH reaches a single jump host only from the operator's IP, and spoke VMs are private and reachable only from the hub management subnet.",
      "Wrote a verification suite that proves the isolation in both the control plane and the data plane, with deploy and destroy scripts that keep the lab cost disciplined.",
    ],
    tags: ["Azure VNet", "VNet Peering", "NSGs", "Azure CLI", "Bash"],
  },
  {
    org: "California State University, Los Angeles",
    role: "Bachelor of Science in Computer Science",
    location: "Los Angeles, CA",
    kind: "education",
    points: [
      "Systems and networking: Operating Systems, Internet Architecture, and Network Protocols.",
      "Algorithms and security: Data Structures, Algorithms, and Cryptography.",
      "Software and data: Software Engineering and Database Management.",
      "Cloud and AI: Cloud Computing and Machine Learning.",
    ],
    tags: [
      "Operating Systems",
      "Networking",
      "Algorithms",
      "Cryptography",
      "Software Engineering",
      "Databases",
      "Cloud Computing",
      "Machine Learning",
    ],
  },
];

export type Project = {
  title: string;
  // key maps to an inline SVG icon in the Icon component.
  icon: "cloud-cog" | "container" | "layers" | "code-xml" | "chart-line" | "shield-check";
  period?: string;
  blurb: string;
  code: string;
  demo?: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    title: "AWS, Azure and GCP Cloud Infrastructure",
    icon: "cloud-cog",
    blurb:
      "Multi-cloud and hybrid infrastructure on AWS, Azure, and GCP: compute, identity, storage, and serverless, connected through VPC peering, Transit Gateway, and ExpressRoute.",
    code: "https://github.com/loriamichaelj",
    tags: ["EC2", "VPC", "IAM", "Azure VMs", "VNet", "Entra ID", "Compute Engine", "Cloud IAM", "Transit Gateway", "ExpressRoute"],
  },
  {
    title: "Containerized Deployment",
    icon: "container",
    blurb:
      "Containerizing applications with Docker and running them on Kubernetes with Helm across EKS, AKS, and GKE, with images stored in ECR, ACR, or Artifact Registry and releases delivered through GitOps.",
    code: "https://github.com/loriamichaelj",
    tags: ["Docker", "Kubernetes", "Helm", "EKS / AKS / GKE", "ECR / ACR / Artifact Registry", "Istio", "ArgoCD"],
  },
  {
    title: "Infrastructure as Code",
    icon: "layers",
    blurb:
      "Defining cloud environments as code with reusable Terraform modules and managed state, CloudFormation and Bicep templates, and Ansible playbooks, shipped through CI/CD pipelines.",
    code: "https://github.com/loriamichaelj",
    tags: ["Terraform", "CloudFormation", "Bicep", "Ansible", "GitHub Actions", "Jenkins"],
  },
  {
    title: "Full-Stack Web Development",
    icon: "code-xml",
    blurb:
      "End-to-end web application development, from well-structured REST APIs and backend services to responsive, component-driven front ends, deployed to the cloud through automated pipelines.",
    code: "https://github.com/loriamichaelj",
    tags: ["Node.js", "React", "Redux", "Express.js"],
  },
  {
    title: "Monitoring",
    icon: "chart-line",
    blurb:
      "Observability for cloud workloads: metrics, logs, and traces feeding dashboards and alerts, with SLOs and error budgets so issues are caught before users notice.",
    code: "https://github.com/loriamichaelj",
    tags: ["Prometheus", "Grafana", "ELK / Loki", "CloudWatch", "Azure Monitor", "Cloud Monitoring", "OpenTelemetry", "PagerDuty"],
  },
  {
    title: "Security",
    icon: "shield-check",
    blurb:
      "Hardening cloud environments with least-privilege IAM, centralized secrets, threat detection, policy as code, and vulnerability scanning aligned to CIS benchmarks.",
    code: "https://github.com/loriamichaelj",
    tags: ["IAM", "Vault / Key Vault", "GuardDuty", "WAF", "OPA / Kyverno", "Trivy", "CIS"],
  },
];

export type SkillGroup = {
  label: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    label: "Cloud Platforms",
    items: [
      "AWS (EC2, VPC, IAM, S3, RDS, Lambda, ECS, ALB, Route 53, CloudFront, Auto Scaling, KMS, SQS, SNS)",
      "Azure (VMs, VNet, NSGs, Entra ID, Storage, Blob, Functions, ACS, Policy, Blueprints, Cosmos DB)",
      "GCP (Compute Engine, VPC, Cloud IAM, Cloud Storage, Cloud SQL, Cloud Functions, Cloud Run, Pub/Sub, BigQuery, Cloud DNS, Cloud CDN)",
      "Multi-Cloud / Hybrid Cloud Strategy",
      "Cloud Networking (VPC Peering, Transit Gateway, ExpressRoute, Cloud Interconnect)",
      "Networking Fundamentals (DNS, TLS, Load Balancing)",
    ],
  },
  {
    label: "Infrastructure as Code",
    items: [
      "Terraform / OpenTofu (Modules, State, Terragrunt)",
      "CloudFormation / ARM / Bicep / Deployment Manager",
      "AWS CDK / Pulumi / Crossplane",
      "Packer (Golden Images)",
      "Ansible (Playbooks, Roles)",
      "GitOps (ArgoCD, Flux)",
      "IaC Scanning (Checkov, tfsec)",
    ],
  },
  {
    label: "CI/CD",
    items: [
      "Jenkins (Pipelines as Code)",
      "GitHub Actions",
      "GitLab CI / Azure DevOps Pipelines",
      "AWS CodePipeline + CodeBuild / Google Cloud Build",
      "Tekton / Harness",
      "Progressive Delivery (Argo Rollouts)",
      "Artifact Management (ECR, ACR, Artifact Registry, Nexus)",
    ],
  },
  {
    label: "Containers",
    items: [
      "Docker (Best Practices, Docker Compose, hadolint)",
      "Kubernetes (Helm, Kustomize, Deployments, Services)",
      "EKS / AKS / GKE Management",
      "Autoscaling (Karpenter, KEDA)",
      "Service Mesh (Istio)",
      "Container Security (Trivy, Falco)",
    ],
  },
  {
    label: "Monitoring",
    items: [
      "Prometheus + Grafana",
      "ELK / Loki Stack",
      "CloudWatch + Azure Monitor + Google Cloud Monitoring",
      "OpenTelemetry + Jaeger",
      "Datadog",
      "Load Testing (k6)",
      "Alerting (PagerDuty, Opsgenie)",
      "SLOs / Error Budgets",
    ],
  },
  {
    label: "Security",
    items: [
      "IAM & Least Privilege",
      "Secrets Management (Vault, Key Vault, Secret Manager)",
      "Infrastructure Security (GuardDuty, WAF, Security Command Center, Cloud Armor)",
      "Policy as Code (OPA, Kyverno)",
      "Compliance (CIS, SOC 2)",
      "Dependency & Secret Scanning (Snyk, Dependabot, Gitleaks)",
      "SAST / DAST / Code Quality (SonarQube)",
      "OIDC Federation (Keyless CI/CD Auth)",
    ],
  },
  {
    label: "Scripting & Others",
    items: [
      "Python / Bash / PowerShell / Makefile",
      "Advanced Git",
      "Agile + DevOps Culture",
      "FinOps & Cost Optimization",
      "Disaster Recovery & Backup",
      "Chaos Engineering (Chaos Mesh, Litmus)",
      "Platform Engineering (Backstage)",
      "Incident Response & Runbooks",
      "Go / Java (for tooling)",
    ],
  },
  {
    label: "Full-Stack Development",
    items: [
      "JavaScript / TypeScript",
      "React / Angular",
      "Node.js / Express",
      "Spring Boot",
      "REST APIs",
      "SQL Server / PostgreSQL",
    ],
  },
];

export const nav = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#experience" },
  { label: "Services", href: "#services" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];
