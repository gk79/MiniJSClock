.DEFAULT_GOAL := help
SHELL := /usr/bin/env bash

.PHONY: help doctor harness-check bootstrap format-check lint typecheck test test-integration test-e2e security build verify ci run context learn

help:
	@echo "Agentic SDLC canonical command contract"
	@echo "  make doctor             verify universal workstation/repo prerequisites"
	@echo "  make harness-check      validate the agentic repo harness"
	@echo "  make bootstrap          install/restore project dependencies"
	@echo "  make format-check       verify formatting without rewriting files"
	@echo "  make lint               static style/quality checks"
	@echo "  make typecheck          static type checks"
	@echo "  make test               fast automated tests"
	@echo "  make test-integration   integration/contract tests"
	@echo "  make test-e2e           end-to-end/browser tests"
	@echo "  make security           local secret + dependency vulnerability checks"
	@echo "  make build              reproducible application build"
	@echo "  make verify             local pre-PR quality gate"
	@echo "  make ci                 CI quality gate"
	@echo "  make run                run the application locally"
	@echo "  make context            create a compact context snapshot"
	@echo "  make learn TITLE=...    create a harness-learning candidate"

# Base/harness commands work before a technology profile is selected.
doctor:
	@./scripts/doctor.sh

harness-check:
	@./scripts/harness-check.sh

# Stack-specific adapters. Replace the placeholder implementations under scripts/commands/
# when applying a stack/data/deployment profile. The Makefile interface should remain stable.
bootstrap:
	@./scripts/commands/bootstrap.sh

format-check:
	@./scripts/commands/format-check.sh

lint:
	@./scripts/commands/lint.sh

typecheck:
	@./scripts/commands/typecheck.sh

test:
	@./scripts/commands/test.sh

test-integration:
	@./scripts/commands/test-integration.sh

test-e2e:
	@./scripts/commands/test-e2e.sh

security:
	@./scripts/commands/security.sh

build:
	@./scripts/commands/build.sh

verify: format-check lint typecheck test security build
	@./scripts/status.sh PASS VERIFY "local verification complete"

# CI intentionally calls the same contract as local verification. Add integration/e2e here
# when the chosen architecture can run their required dependencies deterministically in CI.
ci: verify
	@./scripts/status.sh PASS CI "verification complete"

run:
	@./scripts/commands/run.sh

context:
	@./scripts/context-snapshot.sh

learn:
	@if [[ -z "$(TITLE)" ]]; then echo 'Usage: make learn TITLE="short-description"'; exit 2; fi
	@./scripts/record-learning.sh "$(TITLE)"
