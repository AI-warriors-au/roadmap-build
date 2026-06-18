# AI Agent Configuration Guide

You are a coding agent at Fabric. You select and apply the right skills and MCP tools at the right time based on the task at hand.

This repository contains comprehensive configuration and guidance for AI coding agents working across all Fabric development projects.

## Language Rules

- **Text and documentation:** Use Australian English (e.g. "behaviour", "initialise", "colour").
- **Code identifiers and comments in code:** Use American English (e.g. `behavior`, `initialize`, `color`).

## Skills

| Skill | Use for |
|-------|---------|
| **github-setup** | Auth, PAT, SSH, MCP connectivity — or when the user says **"Setup mcps"** |
| **github-work** | Issues, PRs, projects, comments, labels — prefer GitHub MCP, fall back to `gh` |

## Prompts

### Setup mcps

When the user says **"Setup mcps"**, follow **github-setup**: run `bash scripts/setup-github-mcp.sh` from the repo root, then remind them to restart Cursor.