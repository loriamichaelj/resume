// -----------------------------------------------------------------------------
// Single source of truth for all site content.
// Edit values here; components read from this file.
// -----------------------------------------------------------------------------

export const profile = {
  name: "Michael J. Loria",
  firstName: "Michael",
  role: "Cloud & Full-Stack Developer",
  // Short headline used in the hero.
  headline:
    "I build cloud-native, full-stack applications — from Azure infrastructure to the user interface.",
  // Slightly longer bio for the About section.
  bio: "Azure-certified application developer. I develop full-stack software and contribute to cloud migration end to end. Today I focus on designing cloud infrastructure on Microsoft Azure and building the full-stack apps that run on it.",
  location: "",
  // Set to "" to hide the email call-to-action.
  email: "mikejloria@gmail.com",
  resumeUrl: "", // optional: link to a downloadable PDF in /public
};

export type Social = {
  label: string;
  href: string;
  // key maps to an inline SVG icon in the Icon component.
  icon: "github" | "linkedin" | "email" | "twitter";
};

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/loriamichaelj", icon: "github" },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "linkedin" },
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
    status: "Microsoft Certified · May 2026",
  },
  {
    name: "Azure Administrator Associate",
    code: "AZ-104",
    status: "In progress · target Q3 2026",
  },
];

export type Experience = {
  org: string;
  role: string;
  period: string;
  kind: "work" | "education";
  points: string[];
  tags?: string[];
};

export const experience: Experience[] = [
  {
    org: "L.A. County Public Defender's Office",
    role: "Application Developer Intern",
    period: "2021 – 2022",
    kind: "work",
    points: [
      "Led an end-to-end cloud migration of a production Helpdesk backend from SharePoint Lists to Microsoft SQL Server on Azure for a 1,000+ user county agency — restructuring the schema, rewriting queries, and cutting page-load latency.",
      "Maintained and extended a Java / Spring / Angular internal web app that replaced a manual, email-based intake process with a single self-service portal for IT tickets and equipment scheduling.",
      "Designed SQL tables, stored procedures, and REST endpoints consumed by the Angular front end, improving data consistency across modules.",
      "Translated business needs from non-technical county staff into requirements, mock-ups, and shipped features on a 5-person Agile / Scrum team running weekly sprints.",
    ],
    tags: ["Java / Spring", "Angular", "Azure SQL", "REST APIs", "Agile / Scrum"],
  },
  {
    org: "California State University, Los Angeles",
    role: "B.S. in Computer Science",
    period: "2018 – 2022",
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
    title: "Azure Cloud Infrastructure",
    period: "2025 – Present",
    blurb:
      "A hub-and-spoke Azure Virtual Network with NSGs, VNet peering, and an Azure Bastion jump host — the network topology used in enterprise Azure migrations.",
    code: "https://github.com/loriamichaelj",
    tags: ["Azure VNet", "NSGs", "Azure Bastion", "Peering"],
  },
  {
    title: "Cloud-Native Web App",
    period: "2025 – Present",
    blurb:
      "A full-stack app on Azure App Service (Node.js / Express / React) backed by Azure SQL, with secrets in Key Vault and CI/CD via GitHub Actions.",
    code: "https://github.com/loriamichaelj",
    tags: ["Azure App Service", "Azure SQL", "Key Vault", "CI/CD"],
  },
  {
    title: "Infrastructure as Code",
    period: "2025 – Present",
    blurb:
      "Codifying the cloud environment as Bicep templates for repeatable, version-controlled, infrastructure-as-code deployments.",
    code: "https://github.com/loriamichaelj",
    tags: ["Bicep", "IaC", "Azure DevOps", "GitHub Actions"],
  },
  {
    title: "Full-Stack Web Development",
    period: "2022 – 2023",
    blurb:
      "Self-directed, project-based deep dive into REST API design and the JavaScript stack — building and deploying multiple full-stack applications.",
    code: "https://github.com/loriamichaelj",
    tags: ["Node.js", "React", "Redux", "Express.js"],
  },
];

export type SkillGroup = {
  label: string;
  items: string[];
};

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    items: ["Java", "Python", "JavaScript / TypeScript", "C++", "SQL", "PL/SQL", "PowerShell"],
  },
  {
    label: "Frameworks & APIs",
    items: ["Spring / Spring Boot", "Angular", "React", "Node.js", "Express.js", "REST", "SOAP"],
  },
  {
    label: "Cloud & DevOps",
    items: ["Microsoft Azure", "Bicep (IaC)", "Azure DevOps", "GitHub Actions", "CI/CD", "Git", "AWS / GCP"],
  },
  {
    label: "Databases",
    items: ["SQL Server", "Azure SQL", "PostgreSQL", "MySQL", "MongoDB", "SharePoint Lists"],
  },
  {
    label: "Networking & Systems",
    items: ["TCP/IP", "DNS / DHCP", "VPN", "NSGs", "Entra ID", "Linux", "Windows"],
  },
  {
    label: "Practices & Data",
    items: ["Agile / Scrum", "SDLC", "OOP", "ITIL workflows", "Power BI", "ML"],
  },
];

export const nav = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];
