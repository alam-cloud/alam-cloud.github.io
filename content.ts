export const LINKS = {
  github: 'https://github.com/alam-cloud',
  githubLegacy: 'https://github.com/InfraPlatformer',
  linkedin: 'https://www.linkedin.com/in/alam-ahmed-cloud-engineer',
  email: 'alamzaibahmad615@gmail.com',
  credly: 'https://www.credly.com/users/alam-zaib-ahmad/badges',
  builderCenter: 'https://builder.aws.com/community/@alamzaibahmad',
};

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  desc: string;
  tags: string[];
  current?: boolean;
}

export const EXPERIENCE: Experience[] = [
  {
    role: 'Managed Services Support Analyst (NOC)',
    company: 'boxxe',
    location: 'Hemel Hempstead',
    period: 'May 2024 — Present',
    desc: 'Frontline production incident response and critical infrastructure monitoring. Troubleshooting production systems, maintaining high availability, and ensuring SLA compliance across managed services.',
    tags: ['Incident Response', 'Monitoring', 'SLA Management'],
    current: true,
  },
  {
    role: 'AWS Community Builder — Dev-Tools',
    company: 'Amazon Web Services',
    location: 'London',
    period: 'Feb 2026 — Present',
    desc: 'Sharing knowledge on cloud security best practices through blog posts, talks, and open source. Engaging with AWS product teams, collaborating with 4,000+ global builders, mentoring peers, and using AWS credits to experiment with secure architectures.',
    tags: ['AWS', 'Community', 'DevTools', 'Security'],
    current: true,
  },
  {
    role: 'Author & Technical Contributor',
    company: 'Envoy Proxy',
    location: 'Remote',
    period: 'Mar 2025 — Dec 2025',
    desc: 'Published Version 2 of the Envoy AI Gateway documentation (serving 10K+ users). Contributed features to the VS Code extension for Envoy Proxy. Collaborated with open-source communities to improve API gateway tooling.',
    tags: ['Open Source', 'Technical Writing', 'API Gateway'],
  },
  {
    role: 'First Line Network Engineer',
    company: 'Computors Ltd',
    location: 'UK',
    period: 'Mar 2023 — May 2024',
    desc: 'Resolved 1,400+ tickets (P1–P4) with high customer satisfaction. Configured and deployed 400+ devices remotely. Hands-on experience with FTTC, leased lines, managed switches, hosted desktops, firewalls, VoIP, and Microsoft 365.',
    tags: ['Networking', 'MSP', 'Firewalls', 'VoIP'],
  },
  {
    role: 'Discovery Programme Participant',
    company: 'Zen Internet',
    location: 'Manchester',
    period: 'Mar 2024',
    desc: "Week-long immersive experience with the UK's largest B Corp broadband provider. Deep dive into FTTP, FTTC technologies, customer service excellence, and broadband troubleshooting.",
    tags: ['FTTP', 'FTTC', 'ISP'],
  },
];

export interface Talk {
  type: 'Podcast' | 'Speaker' | 'Author';
  title: string;
  venue: string;
  date: string;
  links?: { label: string; href: string }[];
  featured?: boolean;
}

export const TALKS: Talk[] = [
  {
    type: 'Podcast',
    title: 'LogiCast AWS News Podcast — S5E27',
    venue: 'Logicata — Secrets Manager updates, GuardDuty AI investigations, and the trillion-dollar billing story',
    date: 'Aug 2026',
    links: [{ label: 'Watch', href: 'https://www.youtube.com/watch?v=QUyqRie6-tU' }],
    featured: true,
  },
  {
    type: 'Speaker',
    title: 'Terraforming the Well-Architected Way',
    venue: 'AWS London Well-Architected User Group — AWS Head Office (33 attendees)',
    date: 'Jul 2026',
    links: [{ label: 'Slides', href: '#' }],
    featured: true,
  },
  {
    type: 'Speaker',
    title: 'Shifting Security Left — Building Secure CI/CD for Multi-Cloud',
    venue: 'London DevOps Meetup',
    date: 'Mar 2026',
    links: [
      { label: 'Slides', href: '#' },
      { label: 'Watch', href: 'https://youtu.be/IzayRY93z88' },
    ],
  },
  {
    type: 'Speaker',
    title: 'eBPF: Revolutionizing Cloud-Native Security',
    venue: 'Cloud Native London — 50 attendees',
    date: 'Feb 2026',
    links: [{ label: 'Slides', href: '#' }],
  },
  {
    type: 'Speaker',
    title: 'Defending the Cloud-Native Frontier: Security as Code with Terraform & OPA',
    venue: 'Yorkshire DevOps — 35 attendees',
    date: 'Oct 2025',
    links: [{ label: 'Watch', href: '#' }],
  },
  {
    type: 'Speaker',
    title: 'Elastic Observability — Automating Elastic with Terraform',
    venue: 'Elastic Community',
    date: '2025',
    links: [{ label: 'Demo repo', href: 'https://github.com/InfraPlatformer/elastic-terraform-demo' }],
  },
];

export interface Article {
  badge?: string;
  title: string;
  desc: string;
  date: string;
  href: string;
}

export const ARTICLES: Article[] = [
  {
    badge: 'New',
    title: 'Security at the Speed of Synth: Policy as Code in the AWS DevToolchain',
    desc: 'CDK-nag, CloudFormation Guard, CodePipeline and Amazon Q Developer — making insecure infrastructure undeliverable across the developer loop.',
    date: 'Aug 2026',
    href: '#',
  },
  {
    badge: 'Talk Recap',
    title: 'Terraforming the Well-Architected Way: Recap from the AWS London WAUG Summer Special',
    desc: 'AWS London Well-Architected User Group recap — practical lessons on Terraform reviews that catch real risk.',
    date: 'Jul 2026',
    href: 'https://builder.aws.com/content/3HGyvM25DcXQaOeeIUhGF6Tj6PQ/terraforming-the-well-architected-way-recap-from-the-aws-london-waug-summer-special',
  },
  {
    title: 'The Guarded Canary: How to Safely Ship AI-Generated Infrastructure on AWS',
    desc: 'A guarded deployment pattern for AI-generated infrastructure using Lambda MicroVMs, policy checks and progressive delivery.',
    date: 'Jul 2026',
    href: 'https://builder.aws.com/content/3FuJq2YhQh31l3A3FOxBwIRin0A/the-guarded-canary-how-to-safely-ship-ai-generated-infrastructure-on-aws',
  },
  {
    title: 'Terraform at MSP Scale: Engineering Multi-Tenant Infrastructure as a Service in 2026',
    desc: 'Beyond terraform apply — orchestrating hundreds of MSP accounts with guardrails and infrastructure as a product.',
    date: 'Jun 2026',
    href: 'https://builder.aws.com/content/3FDkVLwnZueCOxVOJGoXNRgIIaA/terraform-at-msp-scale-engineering-multi-tenant-infrastructure-as-a-service-in',
  },
  {
    badge: '★ Spotlight Pick',
    title: 'The Unseen Pipeline: Engineering Developer Velocity with AWS DevTools in 2026',
    desc: 'Featured in the AWS Community Builders Spotlight — how Kiro, AgentCore and Transform are reshaping developer experience.',
    date: 'Jun 2026',
    href: 'https://builder.aws.com/content/3ElShp5DBoeQCRfc5kaBhwsruIe/the-unseen-pipeline-engineering-developer-velocity-with-aws-dev-tools-in',
  },
  {
    title: 'Progressive Delivery on AWS: AppConfig Feature Flags, Lambda Canary Deployments, and Real-Time Observability',
    desc: 'AppConfig targeting, Lambda canary deployments and CloudWatch Synthetics for automated promotion and rollback.',
    date: 'May 2026',
    href: 'https://builder.aws.com/content/3EM8bMXL03D2K5eG4alo8lrSP8w/progressive-delivery-on-aws-app-config-feature-flags-lambda-canary-deployments-and-real-time-observability',
  },
];

export interface SkillGroup {
  name: string;
  items: { name: string; level: string }[];
}

export const SKILLS: SkillGroup[] = [
  {
    name: 'Cloud Platforms',
    items: [
      { name: 'AWS (EC2 · S3 · IAM · VPC · Lambda)', level: 'Daily driver' },
      { name: 'AWS DevTools (CodePipeline · AppConfig · CodeDeploy)', level: 'Production' },
      { name: 'Azure', level: 'Working knowledge' },
    ],
  },
  {
    name: 'Infrastructure as Code',
    items: [
      { name: 'Terraform (modules · remote state)', level: 'Daily driver' },
      { name: 'AWS CDK / CloudFormation', level: 'Production' },
      { name: 'Ansible', level: 'Production' },
    ],
  },
  {
    name: 'Security & Governance',
    items: [
      { name: 'Policy as Code (OPA · Conftest · cdk-nag · Guard)', level: 'Daily driver' },
      { name: 'IAM · SCPs / RCPs · Security Hub', level: 'Production' },
      { name: 'Secrets & compliance guardrails', level: 'Production' },
    ],
  },
  {
    name: 'Containers & Orchestration',
    items: [
      { name: 'Docker', level: 'Daily driver' },
      { name: 'Kubernetes (EKS)', level: 'Production' },
      { name: 'eBPF / Cilium / Falco', level: 'Working knowledge' },
    ],
  },
  {
    name: 'CI/CD & Scripting',
    items: [
      { name: 'GitHub Actions / CI/CD', level: 'Production' },
      { name: 'Python', level: 'Production' },
      { name: 'Bash · Git · Linux', level: 'Daily driver' },
    ],
  },
  {
    name: 'Networking & Operations',
    items: [
      { name: 'TCP/IP · DNS · Firewalls · VPN', level: 'Production' },
      { name: 'Observability (CloudWatch · Elastic)', level: 'Production' },
      { name: 'Incident & SLA management', level: 'Daily driver' },
    ],
  },
];

export const CERTS = [
  { name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services' },
  { name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services' },
  { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' },
  { name: 'HashiCorp Certified: Terraform Associate', issuer: 'HashiCorp' },
  { name: 'Certified Kubernetes Application Developer (CKAD)', issuer: 'CNCF' },
  { name: 'Microsoft Azure Fundamentals (AZ-900)', issuer: 'Microsoft' },
];

export const NOW_LOG = [
  { date: '2026-09', text: 'Speaking at AWS London WAUG — Terraforming the Well-Architected Way recap published on Builder Center.' },
  { date: '2026-08', text: 'LogiCast podcast S5E27 live. Shipped “Security at the Speed of Synth” — policy-as-code deep dive.' },
  { date: '2026-07', text: 'Studying for SOA-C03 (CloudOps Engineer – Associate) — exam booked for December 2026.' },
  { date: '2026-06', text: 'Spotlight Pick in AWS Community Builders for “The Unseen Pipeline” on developer velocity.' },
  { date: '2026-05', text: 'Building multi-tenant Terraform orchestration patterns for MSP-scale infrastructure.' },
];
