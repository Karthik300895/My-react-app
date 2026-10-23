
// ACL-ADLC Markdown Studio Live Middleware for Vite
function aclMarkdownSaverPlugin() {
  return {
    name: 'acl-markdown-saver',
    configureServer(server) {
      // URL alias rewrite & direct markdown serving
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ? req.url.split('?')[0] : '';
        if (rawUrl === '/markdownstudio' || rawUrl === '/markdownstudio.html') {
          req.url = req.url.replace(/^\/markdownstudio(\.html)?/, '/markdown.html');
        }
        if (
          rawUrl === '/markdown.html' ||
          rawUrl === '/markdown' ||
          rawUrl === '/markdown/'
        ) {
          try {
            const fsMod = await import('node:fs');
            const fs = fsMod.default || fsMod;
            const pathMod = await import('node:path');
            const path = pathMod.default || pathMod;
            const candidates = [
              path.resolve(process.cwd(), 'public/markdown.html'),
              path.resolve(process.cwd(), 'markdown.html'),
              path.resolve(process.cwd(), 'src/public/markdown.html'),
            ];
            for (const cand of candidates) {
              if (fs.existsSync(cand)) {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(fs.readFileSync(cand, 'utf8'));
                return;
              }
            }
          } catch {
            // Fall through
          }
        }
        next();
      });

      // Workflow SVGs and Studio logo static serve
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ? req.url.split('?')[0] : '';
        if (rawUrl === '/greenfield.svg' || rawUrl === '/brownfield.svg' || rawUrl === '/velocityone-studio-logo.png' || rawUrl === '/vo-icon.svg') {
          try {
            const svgName = rawUrl.slice(1);
            const fsMod = await import('node:fs');
            const fs = fsMod.default || fsMod;
            const pathMod = await import('node:path');
            const path = pathMod.default || pathMod;
            const projectRoot = process.cwd();
            const candidates = [
              path.join(projectRoot, 'public', svgName),
              path.join(projectRoot, 'dist', svgName),
              path.join(projectRoot, 'src', 'public', svgName),
              path.join(projectRoot, svgName),
              path.join(projectRoot, 'node_modules', 'acl-adlc', 'src', 'public', svgName),
            ];
            for (const cand of candidates) {
              if (fs.existsSync(cand)) {
                const mime = svgName.endsWith('.png') ? 'image/png' : 'image/svg+xml';
                res.writeHead(200, {
                  'Content-Type': mime,
                  'Cache-Control': 'no-cache',
                });
                res.end(fs.readFileSync(cand));
                return;
              }
            }
          } catch {
            // Fall through to next middleware
          }
        }
        next();
      });

      // API Endpoint: GET /api/list-markdown-files
      server.middlewares.use('/api/list-markdown-files', async (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const fsMod = await import('node:fs');
            const fs = fsMod.default || fsMod;
            const pathMod = await import('node:path');
            const path = pathMod.default || pathMod;
            const projectRoot = process.cwd();
            const mdFiles = [];
            const scanCandidates = ['_acl-output', '_acl_output', 'acl-output'];

            const EXCLUDED_CHILD_NAMES = new Set([
              'skill.md', 'agents.md', 'readme.md', 'changelog.md', 'claude.md',
              'contributing.md', 'security.md', 'addendum.md', 'sources.md',
              'review-triage.md', 'patch-plan.md', 'research.md', 'test-summary.md',
              'sprint-status.md', 'memlog.md', '.memlog.md'
            ]);

            function collect(currentDir, relPrefix) {
              if (!fs.existsSync(currentDir)) return;
              const entries = fs.readdirSync(currentDir, { withFileTypes: true });
              for (const entry of entries) {
                const full = path.join(currentDir, entry.name);
                const rel = relPrefix ? relPrefix + '/' + entry.name : entry.name;
                const lower = entry.name.toLowerCase();
                if (entry.isDirectory()) {
                  if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'tests' || lower.includes('memlog')) {
                    continue;
                  }
                  collect(full, rel);
                } else if (
                  entry.isFile() &&
                  entry.name.endsWith('.md') &&
                  !entry.name.startsWith('.') &&
                  !lower.includes('memlog') &&
                  !lower.startsWith('readiness-report') &&
                  !EXCLUDED_CHILD_NAMES.has(lower)
                ) {
                  const content = fs.readFileSync(full, 'utf8');
                  const stat = fs.statSync(full);
                  let status = 'In Review';
                  const match = content.match(/status:\s*([^\n\r]+)/i);
                  if (match && match[1]) {
                    const raw = match[1].trim().toLowerCase();
                    if (raw.includes('accept') || raw.includes('approved') || raw.includes('final') || raw.includes('updated')) status = 'Approved';
                    else if (raw.includes('reject')) status = 'Rejected';
                    else status = 'In Review';
                  }

                  let projectType = null;
                  const typeMatch = content.match(/project_type:\s*([^\n\r]+)/i);
                  if (typeMatch && typeMatch[1]) {
                    projectType = typeMatch[1].trim().toLowerCase().replaceAll(/['"]/g, '');
                  }

                  let tier = null;
                  const tierMatch = content.match(/tier:\s*([^\n\r]+)/i);
                  if (tierMatch && tierMatch[1]) {
                    const rawTier = tierMatch[1].trim().toLowerCase();
                    if (rawTier.includes('1') || rawTier.includes('spec') || rawTier.includes('self-contained')) {
                      tier = '1';
                    } else if (rawTier.includes('2') || rawTier.includes('major') || rawTier.includes('enterprise') || rawTier.includes('architecture')) {
                      tier = '2';
                    }
                  }

                  mdFiles.push({
                    id: rel.replaceAll(/[^a-zA-Z0-9_-]/g, '_'),
                    folderPath: path.dirname(rel).replaceAll('\\', '/'),
                    filename: entry.name,
                    status,
                    projectType,
                    tier,
                    updatedAt: stat.mtime ? stat.mtime.toISOString() : new Date().toISOString(),
                    content
                  });
                }
              }
            }

            for (const f of scanCandidates) {
              collect(path.join(projectRoot, f), f);
            }

            const seenFiles = new Map();
            for (const item of mdFiles) {
              const key = item.filename.toLowerCase();
              if (!seenFiles.has(key)) {
                seenFiles.set(key, item);
              } else {
                const existing = seenFiles.get(key);
                if (key === 'project-context.md') {
                  if (item.folderPath === '_acl-output' || item.folderPath === 'root') {
                    seenFiles.set(key, item);
                  }
                } else if (existing.folderPath === 'root' || (!existing.folderPath.match(/[0-4]-/) && item.folderPath.match(/[0-4]-/))) {
                  seenFiles.set(key, item);
                }
              }
            }
            const uniqueFiles = Array.from(seenFiles.values());
            uniqueFiles.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

            const activeTier = uniqueFiles.some(
              (f) => (f.filename || '').toLowerCase().includes('epics.md') || (f.filename || '').toLowerCase().includes('spine') || f.tier === '2'
            ) ? '2' : uniqueFiles.find((f) => f.tier)?.tier || '1';

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, files: uniqueFiles, activeTier }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, files: [], error: err.message }));
          }
        } else {
          next();
        }
      });

      // API Endpoint: GET /api/list-agents
      server.middlewares.use('/api/list-agents', async (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const fsMod = await import('node:fs');
            const fs = fsMod.default || fsMod;
            const pathMod = await import('node:path');
            const path = pathMod.default || pathMod;
            const projectRoot = process.cwd();
            const agents = [];

            const agentRoots = [
              path.join(projectRoot, '.claude', 'skills'),
              path.join(projectRoot, '.agents', 'skills'),
              path.join(projectRoot, '.cursor', 'skills'),
              path.join(projectRoot, '.github', 'skills'),
              path.join(projectRoot, '_acl', 'skills'),
              path.join(projectRoot, 'src', 'acl-skills'),
              path.join(projectRoot, 'src', 'core-skills'),
            ];

            const seenAgentNames = new Set();

            function scanAgentDir(dirPath) {
              if (!fs.existsSync(dirPath)) return;
              const entries = fs.readdirSync(dirPath, { withFileTypes: true });
              for (const entry of entries) {
                if (!entry.isDirectory()) continue;
                const skillDir = path.join(dirPath, entry.name);
                let skillPath = path.join(skillDir, 'SKILL.md');
                if (!fs.existsSync(skillPath)) {
                  const found = fs.readdirSync(skillDir).find(f => f.toLowerCase() === 'skill.md');
                  if (found) skillPath = path.join(skillDir, found);
                  else skillPath = null;
                }

                if (skillPath && fs.existsSync(skillPath)) {
                  addAgent(entry.name, skillDir, skillPath);
                } else {
                  try {
                    const subEntries = fs.readdirSync(skillDir, { withFileTypes: true });
                    for (const sub of subEntries) {
                      if (!sub.isDirectory()) continue;
                      const nestedDir = path.join(skillDir, sub.name);
                      let nestedSkill = path.join(nestedDir, 'SKILL.md');
                      if (!fs.existsSync(nestedSkill)) {
                        const found = fs.readdirSync(nestedDir).find(f => f.toLowerCase() === 'skill.md');
                        if (found) nestedSkill = path.join(nestedDir, found);
                        else nestedSkill = null;
                      }
                      if (nestedSkill && fs.existsSync(nestedSkill)) {
                        addAgent(sub.name, nestedDir, nestedSkill);
                      }
                    }
                  } catch (e) {}
                }
              }
            }

            function addAgent(agentName, agentFolder, skillPath) {
              if (seenAgentNames.has(agentName)) return;
              try {
                const content = fs.readFileSync(skillPath, 'utf8');
                seenAgentNames.add(agentName);

                let displayName = agentName;
                let description = '';
                const nameMatch = content.match(/^name:[ 	]*["']?([^"'\r\n]+)["']?/m);
                if (nameMatch && nameMatch[1]) {
                  displayName = nameMatch[1].trim();
                }
                const descMatch = content.match(/^description:[ 	]*["']?([^"'\r\n]+)["']?/m);
                if (descMatch && descMatch[1]) {
                  description = descMatch[1].trim();
                }

                const SKILL_MODULE_MAP = {
                  'acl-agent-analyst': { module: '1-analysis', label: 'Phase 1 · Analysis', short: 'Analysis' },
                  'acl-agent-tech-writer': { module: '1-analysis', label: 'Phase 1 · Analysis', short: 'Analysis' },
                  'acl-document-project': { module: '1-analysis', label: 'Phase 1 · Analysis', short: 'Analysis' },
                  'acl-prfaq': { module: '1-analysis', label: 'Phase 1 · Analysis', short: 'Analysis' },
                  'acl-product-brief': { module: '1-analysis', label: 'Phase 1 · Analysis', short: 'Analysis' },
                  'acl-agent-pm': { module: '2-plan-workflows', label: 'Phase 2 · Planning', short: 'Planning' },
                  'acl-agent-ux-designer': { module: '2-plan-workflows', label: 'Phase 2 · Planning', short: 'Planning' },
                  'acl-prd': { module: '2-plan-workflows', label: 'Phase 2 · Planning', short: 'Planning' },
                  'acl-spec': { module: '2-plan-workflows', label: 'Phase 2 · Planning', short: 'Planning' },
                  'acl-ux': { module: '2-plan-workflows', label: 'Phase 2 · Planning', short: 'Planning' },
                  'acl-agent-architect': { module: '3-solutioning', label: 'Phase 3 · Solutioning', short: 'Solutioning' },
                  'acl-architecture': { module: '3-solutioning', label: 'Phase 3 · Solutioning', short: 'Solutioning' },
                  'acl-check-implementation-readiness': { module: '3-solutioning', label: 'Phase 3 · Solutioning', short: 'Solutioning' },
                  'acl-create-epics-and-stories': { module: '3-solutioning', label: 'Phase 3 · Solutioning', short: 'Solutioning' },
                  'acl-generate-project-context': { module: '3-solutioning', label: 'Phase 3 · Solutioning', short: 'Solutioning' },
                  'acl-agent-dev': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-checkpoint-preview': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-code-review': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-correct-course': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-dev-auto': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-qa-generate-e2e-tests': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-quick-dev': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-retrospective': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-sprint-planning': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-sprint-status': { module: '4-implementation', label: 'Phase 4 · Implementation', short: 'Implementation' },
                  'acl-advanced-elicitation': { module: 'core', label: 'Core · Elicitation', short: 'Core' },
                  'acl-brainstorming': { module: 'core', label: 'Core · Brainstorming', short: 'Core' },
                  'acl-customize': { module: 'core', label: 'Core · Customize', short: 'Core' },
                  'acl-deep-recon': { module: 'core', label: 'Core · Recon', short: 'Core' },
                  'acl-figma-bridge': { module: 'core', label: 'Core · Figma Bridge', short: 'Core' },
                  'acl-forge-idea': { module: 'core', label: 'Core · Ideation', short: 'Core' },
                  'acl-help': { module: 'core', label: 'Core · Help', short: 'Core' },
                  'acl-party-mode': { module: 'core', label: 'Core · Party Mode', short: 'Core' },
                  'acl-review': { module: 'core', label: 'Core · Review', short: 'Core' },
                  'acl-create-architecture': { module: 'v6-shims', label: 'V6 Shims · Architecture', short: 'V6 Shims' },
                  'acl-create-prd': { module: 'v6-shims', label: 'V6 Shims · PRD', short: 'V6 Shims' },
                  'acl-create-story': { module: 'v6-shims', label: 'V6 Shims · Story', short: 'V6 Shims' },
                  'acl-dev-story': { module: 'v6-shims', label: 'V6 Shims · Dev Story', short: 'V6 Shims' },
                  'acl-domain-research': { module: 'v6-shims', label: 'V6 Shims · Research', short: 'V6 Shims' },
                  'acl-edit-prd': { module: 'v6-shims', label: 'V6 Shims · PRD', short: 'V6 Shims' },
                  'acl-market-research': { module: 'v6-shims', label: 'V6 Shims · Research', short: 'V6 Shims' },
                  'acl-technical-research': { module: 'v6-shims', label: 'V6 Shims · Research', short: 'V6 Shims' },
                  'acl-validate-prd': { module: 'v6-shims', label: 'V6 Shims · PRD', short: 'V6 Shims' },
                  'acl-editorial-review': { module: 'v6-shims', label: 'V6 Shims · Editorial', short: 'V6 Shims' },
                  'acl-editorial-review-prose': { module: 'v6-shims', label: 'V6 Shims · Editorial', short: 'V6 Shims' },
                  'acl-editorial-review-structure': { module: 'v6-shims', label: 'V6 Shims · Editorial', short: 'V6 Shims' },
                  'acl-review-adversarial-general': { module: 'v6-shims', label: 'V6 Shims · Review', short: 'V6 Shims' },
                  'acl-review-edge-case-hunter': { module: 'v6-shims', label: 'V6 Shims · Review', short: 'V6 Shims' },
                  'acl-review-verification-gap': { module: 'v6-shims', label: 'V6 Shims · Review', short: 'V6 Shims' },
                };

                let moduleCode = 'acl';
                let moduleLabel = 'ACL Method';
                let moduleShort = 'ACL';

                if (SKILL_MODULE_MAP[agentName]) {
                  const m = SKILL_MODULE_MAP[agentName];
                  moduleCode = m.module;
                  moduleLabel = m.label;
                  moduleShort = m.short;
                } else {
                  const lowerFolder = (agentFolder || '').toLowerCase();
                  if (lowerFolder.includes('1-analysis')) {
                    moduleCode = '1-analysis'; moduleLabel = 'Phase 1 · Analysis'; moduleShort = 'Analysis';
                  } else if (lowerFolder.includes('2-plan') || lowerFolder.includes('plan-workflows')) {
                    moduleCode = '2-plan-workflows'; moduleLabel = 'Phase 2 · Planning'; moduleShort = 'Planning';
                  } else if (lowerFolder.includes('3-solutioning') || lowerFolder.includes('architecture')) {
                    moduleCode = '3-solutioning'; moduleLabel = 'Phase 3 · Solutioning'; moduleShort = 'Solutioning';
                  } else if (lowerFolder.includes('4-implementation') || lowerFolder.includes('quick-dev')) {
                    moduleCode = '4-implementation'; moduleLabel = 'Phase 4 · Implementation'; moduleShort = 'Implementation';
                  } else if (lowerFolder.includes('core-skills') || lowerFolder.includes('core')) {
                    moduleCode = 'core'; moduleLabel = 'Core Module'; moduleShort = 'Core';
                  } else if (lowerFolder.includes('v6-shims')) {
                    moduleCode = 'v6-shims'; moduleLabel = 'V6 Shims'; moduleShort = 'V6 Shims';
                  }
                }

                agents.push({
                  id: agentName,
                  name: agentName,
                  displayName: displayName,
                  description: description,
                  module: moduleCode,
                  moduleLabel: moduleLabel,
                  moduleShort: moduleShort,
                  folderPath: path.relative(projectRoot, agentFolder).replaceAll('\\', '/'),
                  skillFile: {
                    filename: 'SKILL.md',
                    fullPath: path.relative(projectRoot, skillPath).replaceAll('\\', '/'),
                    content: content,
                  },
                });
              } catch (e) {}
            }

            for (const rootCandidate of agentRoots) {
              scanAgentDir(rootCandidate);
            }

            agents.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

            let frameworkVersion = '6.11.46';
            try {
              const pkgCandidates = [
                path.join(projectRoot, 'node_modules', 'acl-adlc', 'package.json'),
                path.join(projectRoot, 'package.json'),
              ];
              for (const cand of pkgCandidates) {
                if (fs.existsSync(cand)) {
                  const p = JSON.parse(fs.readFileSync(cand, 'utf8'));
                  if (p.name === 'acl-adlc' && p.version) {
                    frameworkVersion = p.version;
                    break;
                  }
                  const dep = p?.dependencies?.['acl-adlc'] || p?.devDependencies?.['acl-adlc'];
                  if (dep) {
                    frameworkVersion = String(dep).replace(/^[^0-9]*/, '');
                    break;
                  }
                }
              }
            } catch (e) {}

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, count: agents.length, frameworkVersion, agents }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, agents: [], error: err.message }));
          }
        } else {
          next();
        }
      });

      // API Endpoint: GET /api/git-details (Dynamic User Control Centre Telemetry)
      server.middlewares.use('/api/git-details', async (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const { execFileSync } = await import('node:child_process');
            const url = new URL(req.url, 'http://localhost');
            const simulateUnpushed =
              url.searchParams.get('simulate') === 'unpushed' || url.searchParams.get('unpushed') === 'true';

            const projectRoot = process.cwd();

            const env = {
              ...process.env,
              PATH:
                (process.env.PATH || '') +
                ';' + (process.env.LOCALAPPDATA || process.env.USERPROFILE + '\\AppData\\Local') + '\\Programs\\Git\\cmd;C:\\Program Files\\Git\\cmd',
            };

            if (simulateUnpushed) {
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  isPushed: false,
                  simulated: true,
                  message: 'Repository simulated as not pushed to GitHub',
                  userDetails: null,
                  projectDetails: null,
                  gitDetails: null,
                }),
              );
              return;
            }

            let remoteOrigin = '';
            try {
              remoteOrigin = execFileSync('git', ['remote', 'get-url', 'origin'], {
                cwd: projectRoot,
                env,
                encoding: 'utf8',
              }).trim();
            } catch (e) {
              remoteOrigin = '';
            }

            const isGitHub = /github\.com/i.test(remoteOrigin) || /gitlab\.com/i.test(remoteOrigin);

            let repoOwner = '';
            let repoName = '';
            const match = remoteOrigin.match(/[:/]([^/:]+)\/([^/:]+?)(?:\.git)?$/);
            if (match) {
              repoOwner = match[1];
              repoName = match[2];
            }

            let isPushed = false;
            if (isGitHub) {
              let liveRemoteExists = false;
              try {
                const lsOut = execFileSync('git', ['ls-remote', '--exit-code', 'origin', 'HEAD'], {
                  cwd: projectRoot,
                  env,
                  encoding: 'utf8',
                  timeout: 5000,
                  stdio: ['ignore', 'pipe', 'ignore'],
                }).trim();
                liveRemoteExists = Boolean(lsOut && lsOut.length > 0);
              } catch (e) {
                liveRemoteExists = false;
              }

              if (!liveRemoteExists && repoOwner && repoName) {
                try {
                  const repoRes = await fetch('https://api.github.com/repos/' + repoOwner + '/' + repoName, {
                    headers: { 'User-Agent': 'Node-ACL-ADLC-Studio' },
                  });
                  if (repoRes.ok) {
                    liveRemoteExists = true;
                  }
                } catch (e) {}
              }

              if (liveRemoteExists) {
                try {
                  const unpushedCommits = execFileSync('git', ['log', '@{u}..HEAD', '--oneline'], {
                    cwd: projectRoot,
                    env,
                    encoding: 'utf8',
                    stdio: ['ignore', 'pipe', 'ignore'],
                  }).trim();
                  isPushed = unpushedCommits.length === 0;
                } catch (e) {
                  isPushed = true;
                }
              } else {
                isPushed = false;
              }
            }

            if (!isPushed) {
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  isPushed: false,
                  remoteOrigin: remoteOrigin || null,
                  userDetails: null,
                  projectDetails: null,
                  gitDetails: null,
                }),
              );
              return;
            }

            let gitUserName = '';
            let gitUserEmail = '';
            let lastActivityDate = new Date().toISOString();
            let lastCommitMsg = 'Latest commit';
            try {
              gitUserName =
                execFileSync('git', ['log', '-1', '--format=%an'], {
                  cwd: projectRoot,
                  env,
                  encoding: 'utf8',
                }).trim() || gitUserName;
              gitUserEmail =
                execFileSync('git', ['log', '-1', '--format=%ae'], {
                  cwd: projectRoot,
                  env,
                  encoding: 'utf8',
                }).trim() || gitUserEmail;
              lastActivityDate =
                execFileSync('git', ['log', '-1', '--format=%cd'], {
                  cwd: projectRoot,
                  env,
                  encoding: 'utf8',
                }).trim() || lastActivityDate;
              lastCommitMsg =
                execFileSync('git', ['log', '-1', '--format=%s'], {
                  cwd: projectRoot,
                  env,
                  encoding: 'utf8',
                }).trim() || lastCommitMsg;
            } catch (e) {}

            let ghUserData = null;
            if (repoOwner) {
              try {
                const userRes = await fetch('https://api.github.com/users/' + repoOwner, {
                  headers: { 'User-Agent': 'Node-ACL-ADLC-Studio' },
                });
                if (userRes.ok) {
                  ghUserData = await userRes.json();
                }
              } catch (e) {}
            }

            const responsePayload = {
              isPushed: true,
              remoteOrigin,
              userDetails: {
                username: (ghUserData && ghUserData.login) || repoOwner || gitUserName,
                fullName: (ghUserData && ghUserData.name) || gitUserName,
                email: gitUserEmail || (ghUserData && ghUserData.email) || '',
                avatarUrl: (ghUserData && ghUserData.avatar_url) || null,
                orgRole: 'Admin',
              },
              projectDetails: {
                projectName: repoName || path.basename(projectRoot),
                userRole: 'Lead Developer',
                projectStatus: 'Active',
                linkedRepositories: [remoteOrigin],
                assignedDate: '2026-03-24',
              },
              gitDetails: {
                permissionLevel: 'Admin / Maintainer',
                teams: ['Core Engineering', 'Product Delivery'],
                twoFactorStatus: 'Enabled',
                lastActivity: lastActivityDate + ' (' + lastCommitMsg + ')',
              },
            };

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responsePayload));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        } else {
          next();
        }
      });
      server.middlewares.use('/api/save-markdown', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { folderPath, filename, content, status, autoPush } = JSON.parse(body);
              const fsMod = await import('node:fs');
              const fs = fsMod.default || fsMod;
              const pathMod = await import('node:path');
              const path = pathMod.default || pathMod;
              const { exec } = await import('node:child_process');

              let cleanFolder = (folderPath || '').replaceAll('\\', '/').trim();
              if (!cleanFolder.startsWith('_acl-output') && !cleanFolder.startsWith('_acl_output') && !cleanFolder.startsWith('acl-output')) {
                cleanFolder = cleanFolder && cleanFolder !== 'root' ? path.join('_acl-output', cleanFolder) : '_acl-output';
              }
              if (cleanFolder === '_acl-output' || cleanFolder === 'root' || cleanFolder === '.') {
                const lowerName = (filename || '').toLowerCase();
                if (lowerName === 'project-context.md') cleanFolder = '_acl-output';
                else if (lowerName === 'brief.md') cleanFolder = '_acl-output/1-analysis/acl-product-brief';
                else if (lowerName === 'prd.md') cleanFolder = '_acl-output/2-plan-workflows/acl-prd';
                else if (lowerName === 'architecture-spine.md' || lowerName === 'architecture.md') cleanFolder = '_acl-output/3-solutioning/acl-architecture';
                else if (lowerName === 'epics.md') cleanFolder = '_acl-output/3-solutioning/acl-create-epics-and-stories';
              }
              const targetDir = path.resolve(process.cwd(), cleanFolder);
              if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
              }
              const targetFile = path.join(targetDir, filename);
              fs.writeFileSync(targetFile, content, 'utf8');

              if (autoPush) {
                const gitCmd = 'git add "' + targetFile + '" && git commit -m "docs: update ' + filename + ' [' + (status || 'Approved') + ']" && git push';
                exec(gitCmd, { cwd: process.cwd() }, (gitErr, gitStdout, gitStderr) => {
                  if (gitErr) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, path: targetFile, gitPushed: false, gitError: gitErr.message }));
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, path: targetFile, gitPushed: true }));
                  }
                });
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, path: targetFile, gitPushed: false }));
              }
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { shopPlugins } from './tooling/shopPlugins.ts'
import { aclStudioApiPlugin } from './tools/acl-studio-api.mjs'

// https://vite.dev/config/
// AD-12: the acl-markdown-saver plugin above stays byte-for-byte unchanged; the shop only appends.
export default defineConfig({
  plugins: [
    aclMarkdownSaverPlugin(),aclStudioApiPlugin(),react(), ...shopPlugins()],
})
