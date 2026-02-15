#!/usr/bin/env node

/**
 * GitKraken MCP Server
 * Model Context Protocol server for GitKraken integration
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ErrorCode, ListResourcesRequestSchema, ListToolsRequestSchema, McpError, ReadResourceRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitKrakenMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: "gitkraken-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "git_status",
            description: "Get the current Git repository status",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository (defaults to current directory)"
                }
              }
            }
          },
          {
            name: "git_log",
            description: "Get Git commit history",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                },
                limit: {
                  type: "number",
                  description: "Number of commits to show (default: 10)"
                }
              }
            }
          },
          {
            name: "git_diff",
            description: "Show Git diff for staged/unstaged changes",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                },
                staged: {
                  type: "boolean",
                  description: "Show staged changes (default: false)"
                }
              }
            }
          },
          {
            name: "git_branch",
            description: "List Git branches",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                }
              }
            }
          },
          {
            name: "git_commit",
            description: "Create a Git commit",
            inputSchema: {
              type: "object",
              properties: {
                path: {
                  type: "string",
                  description: "Path to the Git repository"
                },
                message: {
                  type: "string",
                  description: "Commit message"
                },
                all: {
                  type: "boolean",
                  description: "Stage all changes before committing"
                }
              },
              required: ["message"]
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;
        const repoPath = args?.path || process.cwd();

        switch (name) {
          case "git_status":
            return await this.handleGitStatus(repoPath);

          case "git_log":
            return await this.handleGitLog(repoPath, args?.limit || 10);

          case "git_diff":
            return await this.handleGitDiff(repoPath, args?.staged || false);

          case "git_branch":
            return await this.handleGitBranch(repoPath);

          case "git_commit":
            return await this.handleGitCommit(repoPath, args.message, args.all);

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing tool: ${error.message}`);
      }
    });
  }

  async handleGitStatus(repoPath) {
    try {
      const output = execSync('git status --porcelain', {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: output || "Repository is clean"
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get Git status: ${error.message}`);
    }
  }

  async handleGitLog(repoPath, limit) {
    try {
      const output = execSync(`git log --oneline -${limit}`, {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get Git log: ${error.message}`);
    }
  }

  async handleGitDiff(repoPath, staged) {
    try {
      const flag = staged ? '--cached' : '';
      const output = execSync(`git diff ${flag}`, {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: output || "No changes"
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get Git diff: ${error.message}`);
    }
  }

  async handleGitBranch(repoPath) {
    try {
      const output = execSync('git branch -a', {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get Git branches: ${error.message}`);
    }
  }

  async handleGitCommit(repoPath, message, all) {
    try {
      if (all) {
        execSync('git add .', { cwd: repoPath });
      }

      const output = execSync(`git commit -m "${message}"`, {
        cwd: repoPath,
        encoding: 'utf8'
      });

      return {
        content: [
          {
            type: "text",
            text: "Commit created successfully:\n" + output
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create commit: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("GitKraken MCP server running on stdio");
  }
}

// Start the server
const server = new GitKrakenMCPServer();
server.run().catch(console.error);
