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
    "I build cloud-native, full-stack applications, from Multi-Cloud infrastructure to the user interface.",
  // Slightly longer bio for the About section.
  bio: "Cloud engineer certified in Azure and AWS. I develop full-stack software and contribute to cloud migration end to end. Today I focus on designing multi-cloud infrastructure and building the full-stack apps that run on it.",
  location: "",
  // Set to "" to hide the email call-to-action.
  email: "mikejloria@gmail.com",
  resumeUrl: "", // optional: link to a downloadable PDF in /public
};

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
  kind: "project" | "work" | "education";
  // Optional repository link, shown on project entries.
  link?: string;
  points: string[];
  tags?: string[];
};

export const experience: Experience[] = [
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
    org: "L.A. County Public Defender's Office",
    role: "Application Developer / Cloud Support Engineer",
    kind: "work",
    points: [
      "Led an end-to-end cloud migration of a production Helpdesk backend from SharePoint Lists to Microsoft SQL Server on Azure for a 1,000+ user county agency, restructuring the schema, rewriting queries, and cutting page load times.",
      "Maintained and extended a Java / Spring / Angular internal web app that replaced a manual intake process run over email with a single self-service portal for IT tickets and equipment scheduling.",
      "Designed SQL tables, stored procedures, and REST endpoints consumed by the Angular front end, improving data consistency across modules.",
      "Translated business needs from nontechnical county staff into requirements, mockups, and shipped features on an Agile / Scrum team of five running weekly sprints.",
    ],
    tags: ["Java / Spring", "Angular", "Azure SQL", "REST APIs", "Agile / Scrum"],
  },
  {
    org: "California State University, Los Angeles",
    role: "B.S. in Computer Science",
    kind: "education",
    points: [
      "Coursework: Data Structures, Algorithms, Software Engineering, Database Management, Operating Systems, Internet Architecture, Network Protocols, Cryptography, Cloud Computing, and Machine Learning.",
      "IEEE member and Calculus tutor.",
    ],
    tags: ["Algorithms", "Databases", "Cryptography", "Cloud Computing", "Machine Learning"],
  },
];

export type Project = {
  title: string;
  period?: string;
  blurb: string;
  code: string;
  demo?: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    title: "Azure and AWS Cloud Infrastructure",
    blurb:
      "Multi-cloud and hybrid infrastructure on AWS and Azure: compute, identity, storage, and serverless, connected through VPC peering, Transit Gateway, and ExpressRoute.",
    code: "https://github.com/loriamichaelj",
    tags: ["EC2", "VPC", "IAM", "Azure VMs", "VNet", "Entra ID", "Transit Gateway", "ExpressRoute"],
  },
  {
    title: "Containerized Deployment",
    blurb:
      "Containerizing applications with Docker and running them on Kubernetes with Helm across EKS and AKS, with images stored in ECR or ACR and releases delivered through GitOps.",
    code: "https://github.com/loriamichaelj",
    tags: ["Docker", "Kubernetes", "Helm", "EKS / AKS", "ECR / ACR", "Istio", "ArgoCD"],
  },
  {
    title: "Infrastructure as Code",
    blurb:
      "Defining cloud environments as code with reusable Terraform modules and managed state, CloudFormation and Bicep templates, and Ansible playbooks, shipped through CI/CD pipelines.",
    code: "https://github.com/loriamichaelj",
    tags: ["Terraform", "CloudFormation", "Bicep", "Ansible", "GitHub Actions", "Jenkins"],
  },
  {
    title: "Full-Stack Web Development",
    blurb:
      "End-to-end web application development, from well-structured REST APIs and backend services to responsive, component-driven front ends, deployed to the cloud through automated pipelines.",
    code: "https://github.com/loriamichaelj",
    tags: ["Node.js", "React", "Redux", "Express.js"],
  },
  {
    title: "Monitoring",
    blurb:
      "Observability for cloud workloads: metrics, logs, and traces feeding dashboards and alerts, with SLOs and error budgets so issues are caught before users notice.",
    code: "https://github.com/loriamichaelj",
    tags: ["Prometheus", "Grafana", "ELK / Loki", "CloudWatch", "Azure Monitor", "OpenTelemetry", "PagerDuty"],
  },
  {
    title: "Security",
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
      "AWS (EC2, VPC, IAM, S3, RDS, Lambda, EKS, ECS, Route 53, CloudFront, Auto Scaling)",
      "Azure (VMs, VNet, Entra ID, Storage, Blob, Functions, AKS, ACS, Policy, Blueprints, Cosmos DB, Monitor)",
      "Multi-Cloud / Hybrid Cloud Strategy",
      "Cloud Networking (VPC Peering, Transit Gateway, ExpressRoute)",
    ],
  },
  {
    label: "Infrastructure as Code",
    items: [
      "Terraform (Modules, State, Best Practices)",
      "CloudFormation / ARM / Bicep",
      "Ansible (Playbooks, Roles)",
      "GitOps (ArgoCD, Flux)",
      "Pulumi / Crossplane",
    ],
  },
  {
    label: "CI/CD",
    items: [
      "Jenkins (Pipelines as Code)",
      "GitHub Actions",
      "GitLab CI / Azure DevOps Pipelines",
      "AWS CodePipeline + CodeBuild",
      "ArgoCD / Tekton / Harness",
      "Artifact Management (ECR, ACR, Nexus)",
    ],
  },
  {
    label: "Containers",
    items: [
      "Docker (Best Practices)",
      "Kubernetes (Helm, Deployments, Services)",
      "EKS / AKS Management",
      "Service Mesh (Istio)",
      "Container Security (Trivy, Falco)",
    ],
  },
  {
    label: "Monitoring",
    items: [
      "Prometheus + Grafana",
      "ELK / Loki Stack",
      "CloudWatch + Azure Monitor",
      "OpenTelemetry + Jaeger",
      "Alerting (PagerDuty, Opsgenie)",
      "SLOs / Error Budgets",
    ],
  },
  {
    label: "Security",
    items: [
      "IAM & Least Privilege",
      "Secrets Management (Vault, Key Vault)",
      "Infrastructure Security (GuardDuty, WAF)",
      "Policy as Code (OPA, Kyverno)",
      "Compliance (CIS, SOC 2)",
      "Vulnerability Scanning",
    ],
  },
  {
    label: "Scripting & Others",
    items: [
      "Python / Bash / PowerShell",
      "Advanced Git",
      "Agile + DevOps Culture",
      "FinOps & Cost Optimization",
      "Disaster Recovery & Backup",
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
