#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../lib/output.sh"

failed=0

# Free local secret scan. Directory mode covers the current working tree,
# including uncommitted files, which is the shift-left use case for make verify.
if ! command -v gitleaks >/dev/null 2>&1; then
  status_fail secrets "gitleaks is required for the local security baseline"
  failed=1
elif gitleaks dir . --no-banner --no-color --redact >/dev/null; then
  status_pass secrets "Gitleaks found no secrets in the working tree"
else
  status_fail secrets "Gitleaks reported one or more findings"
  failed=1
fi

# Run OSV-Scanner only when the repository appears to contain dependency metadata.
has_dependency_metadata=0
while IFS= read -r -d '' _; do
  has_dependency_metadata=1
  break
done < <(find . -type f \
  \( -name 'package-lock.json' -o -name 'pnpm-lock.yaml' -o -name 'yarn.lock' \
     -o -name 'bun.lock' -o -name 'uv.lock' -o -name 'poetry.lock' \
     -o -name 'requirements.txt' -o -name 'Pipfile.lock' -o -name 'pyproject.toml' \
     -o -name 'go.mod' -o -name 'go.sum' -o -name 'Cargo.lock' \
     -o -name 'pom.xml' -o -name 'gradle.lockfile' -o -name 'packages.lock.json' \
     -o -name '*.csproj' -o -name '*.fsproj' -o -name 'composer.lock' -o -name 'Gemfile.lock' \) \
  -not -path './.git/*' -print0 2>/dev/null)

if (( has_dependency_metadata == 0 )); then
  status_na dependencies "no supported dependency manifests detected"
elif ! command -v osv-scanner >/dev/null 2>&1; then
  status_fail dependencies "osv-scanner is required when dependency manifests are present"
  failed=1
elif osv-scanner scan source -r .; then
  status_pass dependencies "OSV-Scanner reported no known vulnerable dependencies"
else
  status_fail dependencies "OSV-Scanner reported findings or could not complete the scan"
  failed=1
fi

if (( failed )); then
  status_fail SECURITY "one or more security checks failed"
  exit 1
fi
status_pass SECURITY "baseline checks passed"
