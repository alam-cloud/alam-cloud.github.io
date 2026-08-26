# Security at the Speed of Synth: Policy as Code in the AWS DevToolchain

**CDK-nag, CloudFormation Guard, CodePipeline and Amazon Q Developer — how to make insecure infrastructure undeliverable without ever leaving the AWS toolchain.**

**Alam Ahmed**  
Community Builder  
Cloud Infrastructure Engineer | AWS Enthusiast | DevOps

---

## The gate is in the wrong place

Here's a scene every AWS shop will recognise. A developer writes a CDK stack on Monday. The pull request lands on Wednesday. Security review happens on Friday — in a spreadsheet, by a human who is also reviewing eleven other teams — and the deployment goes out the following Tuesday with a `0.0.0.0/0` ingress rule nobody clocked, because it was hidden inside a convenience method three construct levels deep.

We keep calling this "shift-left security," but look at where the gate actually sits: after the code is written, after the review, millimetres in front of production — staffed by the most overloaded people in the building.

That's not shifting left. That's just a slower right.

I'm a DevTools person, so my instinct is never "add another review." It's **move the check into the tool the developer is already using**. And this is where the AWS-native toolchain has quietly become genuinely excellent — because security enforcement can now live at every stage of the developer loop:

```text
INNER LOOP (seconds)          OUTER LOOP (minutes)           RUNTIME (always)
─────────────────────         ─────────────────────          ─────────────────
Editor: Amazon Q Developer    Synth: cdk-nag                 Config rules
  security scanning           Pipeline: CodeBuild + Guard    Security Hub
CLI: cdk synth fails          Deploy: CodePipeline gates     RCPs / SCPs
  on violations                                                (the hard backstop)
```

Same policies. Multiple enforcement points. The developer gets feedback in seconds in the editor, the pipeline hard-blocks in minutes, and the cloud itself is the final backstop. Nobody waits for Friday's spreadsheet.

Let's build the whole thing — and, just as importantly, let's talk about where the model needs operational discipline.

---

## Layer 1 — The editor: Amazon Q Developer as the first reviewer

The cheapest security finding is the one that never gets typed. Amazon Q Developer in the IDE does two useful jobs here: it can generate infrastructure code that starts closer to AWS best practice, and its security scanning can flag issues inline — hardcoded credentials, overly permissive IAM, unencrypted resources — before the file is even saved.

There is a practical caveat, though: **AI assistance is probabilistic, not deterministic**. Giving the assistant good repository context — a README that documents your tagging standard, encryption baseline and module conventions — can improve the quality of suggestions where the tool supports that context. But it is not a guarantee. The model does not become your control plane just because it has read your standards document.

So treat the AI layer as a force multiplier, not a foundation. It can reduce the number of mistakes that reach the next stage. It should never be the only thing standing between a bad idea and production.

You don't build a security posture on "the model probably won't suggest a public bucket." You build it on deterministic checks. That's the next layer.

---

## Layer 2 — Synth time: cdk-nag makes the CDK refuse

This is the crown jewel of AWS-native policy-as-code. If you're a CDK shop and not using it, stop reading and install `cdk-nag` right now. I'll wait.

`cdk-nag` walks your construct tree at synthesis and evaluates every CloudFormation resource against a rule pack — AWS Solutions, NIST 800-53, HIPAA, PCI DSS, Serverless and more. If a resource violates a rule at `ERROR` level, `cdk synth` itself fails. The template never materialises. There is nothing to deploy.

```ts
// bin/app.ts
import { App, Validations } from 'aws-cdk-lib';
import { AwsSolutionsChecks, NIST80053R5Checks } from 'cdk-nag';
import { PlatformStack } from '../lib/platform-stack';

const app = new App();
new PlatformStack(app, 'PlatformStack');

// Every construct in the app, every synth, every time
Validations.of(app).addPlugins(new AwsSolutionsChecks(app, { verbose: true }));
Validations.of(app).addPlugins(new NIST80053R5Checks(app));

app.synth();
```

Watch what happens when a developer writes the classic mistake:

```ts
// lib/platform-stack.ts — what not to do
const sg = new ec2.SecurityGroup(this, 'BastionSg', { vpc });
sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
```

```text
$ cdk synth
[Error at /PlatformStack/BastionSg/Resource] AwsSolutions-EC23:
The Security Group allows for 0.0.0.0/0 ingress.
[Error at /PlatformStack/BastionSg/Resource] NIST80053R5-EC2-...
```

Synth fails. Feedback arrives in about ten seconds, in the terminal the developer is already staring at, naming the exact construct path and the exact rule. Compare that to the Friday spreadsheet.

Three details separate teams who succeed with `cdk-nag` from teams who disable it in a fortnight.

### 1. Acknowledge deliberately, not silently

Every suppression should be code, reviewed in a pull request, with a mandatory reason and an expiry or review date:

```ts
Validations.of(sg).acknowledge({
  id: 'AwsSolutions-EC23',
  reason: 'Bastion reachable from office egress IP only; JIRA SEC-412; review 2026-12-01',
});
```

Acknowledgments are auditable in version control and recorded in CDK's policy-validation report. For compliance tooling that expects the older template-level format, `cdk-nag` can also write acknowledged rules into CloudFormation metadata. An exception with a ticket number, an owner and a review date is governance. A `--force` flag is not.

Make the exception format boring and consistent:

- **Rule ID**
- **Business or technical reason**
- **Named owner**
- **Ticket**
- **Expiry or review date**
- **Compensating control**

The expiry date matters. An exception without a deadline is not an exception; it is a quiet policy deletion.

### 2. Ship your own NagPack

The built-in packs encode AWS's opinions. Your organisation has its own — mandatory cost-allocation tags, approved regions, naming standards, approved KMS keys. A custom pack is one class:

```ts
// lib/org-checks.ts
import { CfnResource } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import {
  NagMessageLevel,
  NagPack,
  NagPackProps,
  NagRuleCompliance,
} from 'cdk-nag';

export class OrgChecks extends NagPack {
  public readonly name = 'OrgChecks';

  constructor(scope?: IConstruct, props?: NagPackProps) {
    super(scope, props);
    this.packName = 'Org';
  }

  protected checkResource(node: CfnResource): void {
    this.applyRule({
      ruleSuffixOverride: 'ResourceOwnerTag',
      info: 'Every resource must carry an "owner" tag.',
      explanation: 'Untagged resources cannot be attributed during incident response or cost review.',
      level: NagMessageLevel.ERROR,
      rule: (resource: CfnResource) => {
        const tags = resource.stack.resolve(resource.tags.renderTags());
        return Array.isArray(tags) && tags.some(t => t.Key === 'owner')
          ? NagRuleCompliance.COMPLIANT
          : NagRuleCompliance.NON_COMPLIANT;
      },
      node,
    });
  }
}
```

Publish it as an internal package — CodeArtifact is the obvious home — pin the version, and every team inherits the organisation's standards on their next dependency update. This is the DevTools dream: **policy distributed as a dependency**.

### 3. Warnings are a migration strategy, not a permanent hiding place

Run new packs at `WARN` for a fixed period while teams remediate, then promote them to `ERROR`. Hard-blocking fifty legacy findings on day one is how policy-as-code initiatives get routed around.

But warnings need a plan. Otherwise they become background noise.

A workable adoption path looks like this:

1. **Baseline the estate.** Use AWS Config, Security Hub and your existing scanners to understand what is already non-compliant.
2. **Introduce rules at `WARN`.** Announce the window and the deadline before the first build fails.
3. **Group findings by service or team.** "S3 public access" and "open security groups" are easier to burn down than one giant wall of findings.
4. **Fix the highest-risk classes first.** Public exposure, IAM privilege escalation, unencrypted data and missing audit trails usually outrank naming conventions.
5. **Promote by cohort.** Move new applications to `ERROR` first, then platform-owned modules, then legacy estates as remediation completes.
6. **Expire exceptions.** Require an owner, ticket and review date for every suppression.
7. **Audit the bypasses monthly.** If the same team needs the same exception every month, the policy, the module or the training needs attention.

The secure path must be the fastest path — but during migration, you also need a visible path from today's reality to tomorrow's baseline.

---

## Layer 3 — The pipeline: CloudFormation Guard inside CodePipeline

`cdk-nag` validates at the construct layer. But constructs aren't the only way templates come into existence. Raw overrides, imported templates via `cloudformation-include`, generated resources and legacy CloudFormation estates being modernised can all bypass the intent expressed in high-level constructs.

You need a second, independent check on the synthesized template itself. That's what CloudFormation Guard (`cfn-guard`) is for: a policy language that evaluates the final JSON or YAML artifact.

```guard
# pipeline.guard — no public S3 buckets, no world-open ingress

rule no_public_buckets {
  let buckets = Resources.*[ Type == "AWS::S3::Bucket" ]

  when %buckets !empty {
    %buckets.Properties.PublicAccessBlockConfiguration exists
    %buckets.Properties.PublicAccessBlockConfiguration.BlockPublicAcls == true
    %buckets.Properties.PublicAccessBlockConfiguration.BlockPublicPolicy == true
      <<Bucket %buckets is missing a public access block>>
  }
}

rule no_world_open_ingress {
  let sgs = Resources.*[ Type == "AWS::EC2::SecurityGroup" ]

  when %sgs !empty {
    %sgs.Properties.SecurityGroupIngress[*].CidrIp != "0.0.0.0/0"
      <<SecurityGroup %sgs allows ingress from 0.0.0.0/0>>
  }
}
```

Now wire it into a native AWS pipeline. The shape of it in CDK Pipelines — or a plain CodeBuild step, because the idea is the same:

```ts
// A validation wave that runs Guard against every synthesized template
pipeline.addWave('PolicyValidation', {
  pre: [
    new CodeBuildStep('CfnGuard', {
      input: synthStep, // the cdk.out cloud assembly
      installCommands: [
        'curl --proto "=https" --tlsv1.2 -sSf https://raw.githubusercontent.com/aws-cloudformation/cloudformation-guard/main/install-guard.sh | sh',
        'export PATH=$PATH:~/.guard/bin',
      ],
      commands: [
        'for t in cdk.out/*.template.json; do cfn-guard validate -r pipeline.guard -d "$t" || exit 1; done',
      ],
    }),
  ],
});
```

Two checkers, two layers, two different perspectives, one property that matters: a finding has to be acknowledged deliberately twice to slip through both. The placement matters too — this runs against the cloud assembly **before any deploy stage**, so the blast radius of a policy failure is a red pipeline, not a broken account.

### Avoid turning two layers into two sources of truth

The obvious objection is duplication: "Why am I maintaining one rule in TypeScript and another in Guard's DSL?"

The answer is not to write every rule twice forever. It is to be clear about what each layer owns:

- **`cdk-nag` owns construct intent.** It can see patterns, L2 constructs and abstractions before they become CloudFormation.
- **Guard owns the deployable artifact.** It checks what CloudFormation will actually receive, including raw overrides and imported templates.

For a small estate, a documented mapping between NagPack rules and Guard rules may be enough. For a larger organisation, define a shared policy catalogue — rule ID, description, severity, owner, remediation link — and generate or review both implementations from it. The policy has one identity even if it has two technical expressions.

That prevents the slow divergence where `cdk-nag` says one thing, Guard says another, and nobody remembers which is authoritative.

### Harden the pipeline itself

A few pipeline-hardening notes from the DevTools side, because the pipeline is also an attack surface:

- **Do not let the pipeline authenticate with long-lived credentials.** Use CodeConnections for source-control integration, OIDC where an external CI system needs AWS access, and short-lived, least-privilege IAM roles for deployment. If your pipeline still relies on an IAM user's access key sitting in a parameter store, that is your highest-priority security finding. Everything else in this article is garnish.
- **Policy files are pipeline inputs.** Version and review them like application code. A pull request that weakens `pipeline.guard` should trigger the same scrutiny as a pull request that opens a port — ideally stricter, with a security-team `CODEOWNERS` review on the policy path.
- **Manual approval is not a substitute for automation.** Use it where judgment or blast radius genuinely requires a human: irreversible production data migrations, shared networking changes, unusual cost increases, third-party vendor access or ambiguous data-classification decisions.
- **Design for approval fatigue.** A human reviewing fifty routine deployments a day is not a control; they are a bottleneck with a mouse. Automate the objective checks and reserve human review for the decisions that need context, trade-offs and accountability.

---

## Layer 4 — The backstop: the cloud says no

Everything above can still be bypassed by someone with console access and sufficient privilege. So the final layer isn't in the toolchain at all — it's in AWS Organizations.

Resource Control Policies are the non-negotiable floor where they are available: no matter what any pipeline, developer or break-glass role attempts, an RCP can make entire classes of action — disabling CloudTrail, leaving the approved region set, touching the billing configuration — impossible at the organisation level.

Where RCPs are not yet available or not yet adopted, Service Control Policies are the nearest organisation-level equivalent, with the caveat that they are attached to organisations, OUs or accounts rather than directly to resources. That makes OU design part of your security architecture. A coarse SCP applied to the wrong OU can either block legitimate work or leave a gap you thought you had closed.

Pair the preventive controls with AWS Config conformance packs for continuous detection and Security Hub to aggregate findings into one pane.

The layered logic, stated plainly:

| Layer | Tool | Failure mode it covers |
|---|---|---|
| Editor | Amazon Q Developer | Mistakes caught before they are committed |
| Synth | cdk-nag | Insecure constructs and CDK-level patterns |
| Pipeline | cfn-guard in CodePipeline | Raw overrides, imported and legacy templates |
| Organisation | RCPs or SCPs | Console changes, compromised credentials, break-glass misuse |
| Runtime | Config + Security Hub | Drift and anything that slips through the earlier layers |

Any single layer can fail. All five failing simultaneously is a very different bet.

---

## Not a CDK shop? The pattern still works

The tools change, but the architecture does not.

For a Terraform estate, the equivalent path might be:

- **Authoring:** editor diagnostics and AI-assisted review
- **Static analysis:** TFLint, Checkov or tfsec
- **Plan-time policy:** OPA/Conftest against `terraform plan`, or Sentinel in HCP Terraform
- **Pipeline:** policy checks before apply
- **Organisation:** RCPs or SCPs
- **Runtime:** Config and Security Hub

The principle is portable even when the syntax isn't: fast feedback close to the author, deterministic checks against the deployable artifact, preventive guardrails at the organisation boundary, and detective controls for drift.

The same applies to mixed estates. A legacy CloudFormation account might skip the `cdk-nag` layer entirely but still use Guard in the pipeline, organisation policies as the floor, and Config for continuous detection. The point is not purity. The point is coverage.

---

## Design a real escape hatch

If you don't design an escape hatch, your developers will.

There will be legitimate cases where a control needs to be bypassed: a temporary debugging stack in a sandbox, a proof of concept, a vendor integration with an unusual requirement. Pretending otherwise does not make your environment more secure. It just pushes the workaround out of sight.

A good escape hatch is:

- **Explicit:** The developer chooses a documented exception mechanism rather than disabling the check.
- **Scoped:** It applies to one resource, stack, account or OU — not the whole organisation.
- **Time-bound:** It expires or requires reapproval.
- **Owned:** A person or team is accountable for it.
- **Auditable:** Security can list every active exception without spelunking through build logs.
- **Environment-aware:** Sandbox exceptions should not automatically inherit production privileges.

For example, a temporary sandbox exception might carry a tag such as `policy-exception: SEC-412:2026-12-01`, with the pipeline rejecting it outside approved sandbox accounts. The exact mechanism matters less than the properties: narrow, temporary, visible and owned.

---

## Know what this costs

The inner-loop controls are inexpensive. `cdk-nag` and CloudFormation Guard are open source, and the marginal cost is mostly developer time plus a few extra seconds or minutes in synthesis and CI.

The cost profile changes as you move outward:

- **CodeBuild/CodePipeline:** build minutes and pipeline execution time
- **Amazon Q Developer:** depends on the tier and licensing model
- **AWS Config:** configuration items, rule evaluations and conformance packs
- **Security Hub:** security checks and finding ingestion
- **Operational overhead:** maintaining rule packs, triaging findings and reviewing exceptions

That does not mean you should skip the outer layers. It means you should phase them deliberately. Start with the controls that remove the most risk per pound spent, then expand coverage as the organisation matures.

The cheapest control is still the mistake that never reaches production. The most expensive one is the incident nobody detected until the bill, the auditor or the attacker found it first.

---

## Measure whether the road is actually faster

"Security as code" sounds good in a slide deck. You need metrics to know whether it is working in reality.

Track a small set of signals:

- **Lead time from pull request to deployment**
- **Time spent waiting for manual security review**
- **Number of findings reaching production**
- **Number and age of active exceptions**
- **Percentage of repositories covered by each policy layer**
- **Mean time to remediate a finding**
- **False-positive or noisy-rule reports from developers**
- **Policy-related build failures by rule and team**

Do not optimise only for "number of blocked builds." A rule that blocks constantly may be finding real risk, but it may also be badly written, poorly documented or aimed at the wrong layer. The goal is not more red pipelines. The goal is fewer production findings without slowing delivery to a crawl.

When the system is working, two things happen at once: security findings move left, and the total time to ship a compliant change goes down.

---

## What I'd tell my past self

I came to this from the NOC — from being the person paged when the ungoverned change went wrong. The lesson that took the longest to learn wasn't technical. It was this: developers don't route around security because they're careless. They route around it because the secure path is slower.

Every layer in this article shares one design goal: **the secure path must be the fastest path**. Ten-second feedback in the editor. A red pipeline in five minutes instead of a review in five days. Compliant patterns shipped as constructs and rule packs, so doing it right is literally less typing than doing it wrong.

But speed alone is not enough. The road also needs maintenance: a migration plan for legacy findings, a shared policy catalogue so the layers do not drift apart, time-bound exceptions, and metrics that tell you whether the whole thing is helping or just generating noise.

That's what DevTools advocacy means to me in 2026: not more gates, better roads — and a maintenance crew for the roads we build.

The AWS toolchain — Q Developer, CDK, `cdk-nag`, Guard, CodePipeline, RCPs, SCPs, Config and Security Hub — finally gives us the materials. The only thing left is to pave it, measure it, and keep it clear.

---

*Any opinions in this article are those of the individual author and may not reflect the opinions of AWS.*
