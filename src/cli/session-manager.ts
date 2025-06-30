#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Redis } from 'ioredis';
import { RedisStorageAdapter } from '../services/RedisStorageAdapter.js';
import { SessionManager } from '../services/SessionManager.js';
import { sessionAwareToolRegistry } from '../services/SessionAwareToolRegistry.js';
import chalk from 'chalk';
import { boxed } from '../utils/index.js';

/**
 * Session Management CLI Utilities
 * 
 * Command-line interface for managing Redis-backed sessions across
 * all cognitive tools in the thinking-patterns system.
 */

interface CLIContext {
  redis: Redis;
  sessionManager: SessionManager;
  verbose: boolean;
}

/**
 * Initialize Redis connection and session manager
 */
async function initializeCLI(redisUrl?: string, verbose = false): Promise<CLIContext> {
  const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
  
  if (verbose) {
    console.log(chalk.blue(`Connecting to Redis: ${url}`));
  }
  
  const redis = new Redis(url);
  const redisAdapter = new RedisStorageAdapter(redis);
  const sessionManager = new SessionManager(redisAdapter);
  
  try {
    await redis.ping();
    if (verbose) {
      console.log(chalk.green('✓ Redis connection established'));
    }
  } catch (error) {
    console.error(chalk.red('✗ Failed to connect to Redis:'), error);
    process.exit(1);
  }
  
  return { redis, sessionManager, verbose };
}

/**
 * List all sessions with optional filtering
 */
async function listSessions(ctx: CLIContext, options: { tool?: string; pattern?: string; limit?: number }) {
  try {
    const keys = await ctx.redis.keys('session:*');
    
    let sessions = [];
    for (const key of keys) {
      try {
        const sessionId = key.replace('session:', '');
        const sessionData = await ctx.sessionManager.getSession(sessionId);
        
        if (sessionData) {
          // Apply filters
          if (options.tool && sessionData.toolType !== options.tool) {
            continue;
          }
          
          if (options.pattern && !sessionId.includes(options.pattern)) {
            continue;
          }
          
          sessions.push({
            sessionId,
            toolType: sessionData.toolType,
            createdAt: sessionData.createdAt,
            lastAccessedAt: sessionData.lastAccessedAt,
            age: Date.now() - new Date(sessionData.createdAt).getTime()
          });
        }
      } catch (error) {
        if (ctx.verbose) {
          console.warn(chalk.yellow(`Warning: Could not parse session ${key}`));
        }
      }
    }
    
    // Sort by last accessed time
    sessions.sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime());
    
    // Apply limit
    if (options.limit) {
      sessions = sessions.slice(0, options.limit);
    }
    
    if (sessions.length === 0) {
      console.log(chalk.yellow('No sessions found'));
      return;
    }
    
    // Display sessions
    console.log(chalk.bold(`Found ${sessions.length} session(s):`));
    console.log();
    
    sessions.forEach((session, index) => {
      const age = formatDuration(session.age);
      const toolColor = getToolColor(session.toolType);
      
      console.log(`${chalk.gray((index + 1).toString().padStart(3))}. ${chalk.bold(session.sessionId)}`);
      console.log(`     Tool: ${toolColor(session.toolType)}`);
      console.log(`     Created: ${chalk.blue(new Date(session.createdAt).toLocaleString())}`);
      console.log(`     Last accessed: ${chalk.blue(new Date(session.lastAccessedAt).toLocaleString())}`);
      console.log(`     Age: ${chalk.magenta(age)}`);
      console.log();
    });
    
  } catch (error) {
    console.error(chalk.red('Error listing sessions:'), error);
    process.exit(1);
  }
}

/**
 * Get detailed information about a specific session
 */
async function inspectSession(ctx: CLIContext, sessionId: string) {
  try {
    const sessionData = await ctx.sessionManager.getSession(sessionId);
    
    if (!sessionData) {
      console.error(chalk.red(`Session not found: ${sessionId}`));
      process.exit(1);
    }
    
    const age = Date.now() - new Date(sessionData.createdAt).getTime();
    const toolColor = getToolColor(sessionData.toolType);
    
    const sections: Record<string, string | string[]> = {
      'Session ID': sessionId,
      'Tool Type': sessionData.toolType,
      'Created': new Date(sessionData.createdAt).toLocaleString(),
      'Last Accessed': new Date(sessionData.lastAccessedAt).toLocaleString(),
      'Age': formatDuration(age)
    };
    
    // Add tool-specific information
    switch (sessionData.toolType) {
      case 'sequential_thinking':
        const seqData = sessionData as any;
        sections['Thoughts'] = `${seqData.thoughtHistory?.length || 0} thoughts`;
        sections['Branches'] = `${Object.keys(seqData.branches || {}).length} branches`;
        break;
        
      case 'collaborative_reasoning':
        const collabData = sessionData as any;
        sections['Contributions'] = `${collabData.contributionHistory?.length || 0} contributions`;
        sections['Stages Completed'] = Object.keys(collabData.stageProgress || {}).filter(s => collabData.stageProgress[s]).join(', ') || 'None';
        break;
        
      case 'scientific_method':
        const sciData = sessionData as any;
        sections['Stages'] = `${sciData.stageHistory?.length || 0} stages completed`;
        sections['Hypotheses'] = `${sciData.hypothesesHistory?.length || 0} hypotheses tracked`;
        break;
        
      case 'domain_modeling':
        const domainData = sessionData as any;
        sections['Iterations'] = `${domainData.iterationHistory?.length || 0} iterations`;
        sections['Validations'] = `${domainData.validationResults?.length || 0} validation runs`;
        break;
        
      case 'problem_decomposition':
        const problemData = sessionData as any;
        sections['Revisions'] = `${problemData.revisionHistory?.length || 0} revisions`;
        sections['Progress Updates'] = `${problemData.progressUpdates?.length || 0} updates`;
        break;
    }
    
    // Add metadata if present
    if (sessionData.metadata && Object.keys(sessionData.metadata).length > 0) {
      sections['Metadata'] = Object.entries(sessionData.metadata).map(([k, v]) => `${k}: ${v}`);
    }
    
    console.log(boxed(`${toolColor('🔍')} Session Details`, sections));
    
    // Show session data size
    const dataSize = JSON.stringify(sessionData).length;
    console.log(chalk.gray(`Session data size: ${formatBytes(dataSize)}`));
    
  } catch (error) {
    console.error(chalk.red('Error inspecting session:'), error);
    process.exit(1);
  }
}

/**
 * Clear one or more sessions
 */
async function clearSessions(ctx: CLIContext, sessionIds: string[], options: { confirm?: boolean; tool?: string }) {
  try {
    let targetSessionIds = sessionIds;
    
    // If tool filter is specified, get all sessions for that tool
    if (options.tool && sessionIds.length === 0) {
      const keys = await ctx.redis.keys('session:*');
      targetSessionIds = [];
      
      for (const key of keys) {
        const sessionId = key.replace('session:', '');
        const sessionData = await ctx.sessionManager.getSession(sessionId);
        
        if (sessionData && sessionData.toolType === options.tool) {
          targetSessionIds.push(sessionId);
        }
      }
    }
    
    if (targetSessionIds.length === 0) {
      console.log(chalk.yellow('No sessions to clear'));
      return;
    }
    
    // Confirmation prompt
    if (!options.confirm) {
      console.log(chalk.yellow(`About to clear ${targetSessionIds.length} session(s):`));
      targetSessionIds.forEach(id => console.log(`  - ${id}`));
      console.log(chalk.red('This action cannot be undone!'));
      console.log(chalk.blue('Use --confirm flag to proceed'));
      return;
    }
    
    // Clear sessions
    let cleared = 0;
    let errors = 0;
    
    for (const sessionId of targetSessionIds) {
      try {
        await ctx.sessionManager.clearSession(sessionId);
        cleared++;
        
        if (ctx.verbose) {
          console.log(chalk.green(`✓ Cleared session: ${sessionId}`));
        }
      } catch (error) {
        errors++;
        console.error(chalk.red(`✗ Failed to clear session ${sessionId}:`), error);
      }
    }
    
    console.log(chalk.green(`Cleared ${cleared} session(s)`));
    if (errors > 0) {
      console.log(chalk.red(`Failed to clear ${errors} session(s)`));
    }
    
  } catch (error) {
    console.error(chalk.red('Error clearing sessions:'), error);
    process.exit(1);
  }
}

/**
 * Show session statistics and analytics
 */
async function showStats(ctx: CLIContext) {
  try {
    const keys = await ctx.redis.keys('session:*');
    
    const stats = {
      total: 0,
      byTool: {} as Record<string, number>,
      byAge: { '1h': 0, '1d': 0, '1w': 0, older: 0 },
      totalSize: 0,
      avgSize: 0
    };
    
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const day = 24 * hour;
    const week = 7 * day;
    
    for (const key of keys) {
      try {
        const sessionId = key.replace('session:', '');
        const sessionData = await ctx.sessionManager.getSession(sessionId);
        
        if (sessionData) {
          stats.total++;
          
          // Count by tool
          stats.byTool[sessionData.toolType] = (stats.byTool[sessionData.toolType] || 0) + 1;
          
          // Count by age
          const age = now - new Date(sessionData.createdAt).getTime();
          if (age < hour) {
            stats.byAge['1h']++;
          } else if (age < day) {
            stats.byAge['1d']++;
          } else if (age < week) {
            stats.byAge['1w']++;
          } else {
            stats.byAge.older++;
          }
          
          // Calculate size
          const size = JSON.stringify(sessionData).length;
          stats.totalSize += size;
        }
      } catch (error) {
        if (ctx.verbose) {
          console.warn(chalk.yellow(`Warning: Could not analyze session ${key}`));
        }
      }
    }
    
    stats.avgSize = stats.total > 0 ? stats.totalSize / stats.total : 0;
    
    // Display statistics
    const sections: Record<string, string | string[]> = {
      'Total Sessions': stats.total.toString(),
      'Total Storage': formatBytes(stats.totalSize),
      'Average Size': formatBytes(stats.avgSize)
    };
    
    if (Object.keys(stats.byTool).length > 0) {
      sections['By Tool'] = Object.entries(stats.byTool)
        .sort(([,a], [,b]) => b - a)
        .map(([tool, count]) => `${getToolColor(tool)(tool)}: ${count}`);
    }
    
    sections['By Age'] = [
      `< 1 hour: ${stats.byAge['1h']}`,
      `< 1 day: ${stats.byAge['1d']}`,
      `< 1 week: ${stats.byAge['1w']}`,
      `> 1 week: ${stats.byAge.older}`
    ];
    
    console.log(boxed('📊 Session Statistics', sections));
    
  } catch (error) {
    console.error(chalk.red('Error getting statistics:'), error);
    process.exit(1);
  }
}

/**
 * Backup sessions to a file
 */
async function backupSessions(ctx: CLIContext, outputFile: string, options: { tool?: string }) {
  try {
    const keys = await ctx.redis.keys('session:*');
    const backup: any = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      sessions: []
    };
    
    for (const key of keys) {
      try {
        const sessionId = key.replace('session:', '');
        const sessionData = await ctx.sessionManager.getSession(sessionId);
        
        if (sessionData) {
          // Apply tool filter
          if (options.tool && sessionData.toolType !== options.tool) {
            continue;
          }
          
          backup.sessions.push({
            sessionId,
            data: sessionData
          });
        }
      } catch (error) {
        if (ctx.verbose) {
          console.warn(chalk.yellow(`Warning: Could not backup session ${key}`));
        }
      }
    }
    
    // Write backup file
    const fs = await import('fs');
    fs.writeFileSync(outputFile, JSON.stringify(backup, null, 2));
    
    console.log(chalk.green(`✓ Backed up ${backup.sessions.length} session(s) to ${outputFile}`));
    console.log(chalk.gray(`Backup size: ${formatBytes(JSON.stringify(backup).length)}`));
    
  } catch (error) {
    console.error(chalk.red('Error creating backup:'), error);
    process.exit(1);
  }
}

/**
 * Utility functions
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getToolColor(toolType: string): (text: string) => string {
  const colors: Record<string, (text: string) => string> = {
    'sequential_thinking': chalk.blue,
    'collaborative_reasoning': chalk.green,
    'scientific_method': chalk.yellow,
    'domain_modeling': chalk.magenta,
    'problem_decomposition': chalk.cyan,
    'temporal_thinking': chalk.red
  };
  
  return colors[toolType] || chalk.white;
}

/**
 * CLI Interface
 */
async function main() {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('session-manager')
    .usage('$0 <command> [options]')
    .option('redis-url', {
      type: 'string',
      description: 'Redis connection URL',
      default: process.env.REDIS_URL || 'redis://localhost:6379'
    })
    .option('verbose', {
      type: 'boolean',
      alias: 'v',
      description: 'Verbose output',
      default: false
    })
    .command('list', 'List all sessions', (yargs) => {
      return yargs
        .option('tool', {
          type: 'string',
          description: 'Filter by tool type',
          choices: ['sequential_thinking', 'collaborative_reasoning', 'scientific_method', 'domain_modeling', 'problem_decomposition']
        })
        .option('pattern', {
          type: 'string',
          description: 'Filter by session ID pattern'
        })
        .option('limit', {
          type: 'number',
          description: 'Limit number of results',
          default: 50
        });
    })
    .command('inspect <session-id>', 'Inspect a specific session', (yargs) => {
      return yargs.positional('session-id', {
        type: 'string',
        description: 'Session ID to inspect'
      });
    })
    .command('clear [session-ids..]', 'Clear one or more sessions', (yargs) => {
      return yargs
        .positional('session-ids', {
          type: 'string',
          array: true,
          description: 'Session IDs to clear'
        })
        .option('tool', {
          type: 'string',
          description: 'Clear all sessions for a specific tool',
          choices: ['sequential_thinking', 'collaborative_reasoning', 'scientific_method', 'domain_modeling', 'problem_decomposition']
        })
        .option('confirm', {
          type: 'boolean',
          description: 'Confirm the clear operation',
          default: false
        });
    })
    .command('stats', 'Show session statistics')
    .command('backup <output-file>', 'Backup sessions to a file', (yargs) => {
      return yargs
        .positional('output-file', {
          type: 'string',
          description: 'Output file path'
        })
        .option('tool', {
          type: 'string',
          description: 'Backup only sessions for a specific tool'
        });
    })
    .demandCommand(1, 'You must specify a command')
    .help()
    .alias('help', 'h')
    .argv;
  
  const ctx = await initializeCLI(argv['redis-url'], argv.verbose);
  
  try {
    switch (argv._[0]) {
      case 'list':
        await listSessions(ctx, {
          tool: argv.tool as string | undefined,
          pattern: argv.pattern as string | undefined,
          limit: argv.limit as number | undefined
        });
        break;
        
      case 'inspect':
        await inspectSession(ctx, argv['session-id'] as string);
        break;
        
      case 'clear':
        await clearSessions(ctx, (argv['session-ids'] as string[]) || [], {
          confirm: argv.confirm as boolean | undefined,
          tool: argv.tool as string | undefined
        });
        break;
        
      case 'stats':
        await showStats(ctx);
        break;
        
      case 'backup':
        await backupSessions(ctx, argv['output-file'] as string, {
          tool: argv.tool as string | undefined
        });
        break;
    }
  } finally {
    await ctx.redis.quit();
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red('CLI Error:'), error);
    process.exit(1);
  });
}

export { main as sessionManagerCLI };