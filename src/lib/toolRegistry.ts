/**
 * Tool Registry — manages tool definitions, execution, permissions, and logging.
 * 
 * Each tool has:
 * - A JSON schema defining inputs/outputs
 * - A risk level (low/medium/high)
 * - An approval requirement flag
 * - A handler function
 */

export type RiskLevel = 'low' | 'medium' | 'high';
export type ToolStatus = 'available' | 'experimental' | 'broken' | 'disabled';

export interface ToolSpec {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  category: string;
  status: ToolStatus;
  ownerAgent?: string;
}

export interface ToolResult {
  success: boolean;
  output: any;
  error?: string;
  durationMs: number;
}

export interface ToolLogEntry {
  toolName: string;
  agentId: string;
  input: any;
  output: any;
  riskLevel: RiskLevel;
  approved: boolean;
  timestamp: Date;
  durationMs: number;
  success: boolean;
}

type ToolHandler = (input: any) => Promise<any>;

class ToolRegistry {
  private tools: Map<string, ToolSpec> = new Map();
  private handlers: Map<string, ToolHandler> = new Map();
  private logs: ToolLogEntry[] = [];
  private approvalCallback: ((tool: ToolSpec, input: any) => Promise<boolean>) | null = null;

  /**
   * Register a new tool with its spec and handler.
   */
  register(spec: ToolSpec, handler: ToolHandler): void {
    this.tools.set(spec.name, spec);
    this.handlers.set(spec.name, handler);
    console.log(`[ToolRegistry] Registered: ${spec.name} (${spec.riskLevel} risk)`);
  }

  /**
   * Unregister a tool.
   */
  unregister(name: string): void {
    this.tools.delete(name);
    this.handlers.delete(name);
  }

  /**
   * Set the approval callback for high-risk tools.
   */
  setApprovalCallback(cb: (tool: ToolSpec, input: any) => Promise<boolean>): void {
    this.approvalCallback = cb;
  }

  /**
   * Execute a tool by name with given input.
   */
  async execute(name: string, input: any, agentId: string = 'unknown'): Promise<ToolResult> {
    const spec = this.tools.get(name);
    if (!spec) {
      return { success: false, output: null, error: `Tool '${name}' not found`, durationMs: 0 };
    }

    if (spec.status === 'disabled' || spec.status === 'broken') {
      return { success: false, output: null, error: `Tool '${name}' is ${spec.status}`, durationMs: 0 };
    }

    // Check approval for high-risk tools
    if (spec.requiresApproval && this.approvalCallback) {
      const approved = await this.approvalCallback(spec, input);
      if (!approved) {
        return { success: false, output: null, error: 'User denied approval', durationMs: 0 };
      }
    }

    const handler = this.handlers.get(name);
    if (!handler) {
      return { success: false, output: null, error: `No handler for tool '${name}'`, durationMs: 0 };
    }

    const start = Date.now();
    try {
      const output = await handler(input);
      const durationMs = Date.now() - start;

      const log: ToolLogEntry = {
        toolName: name,
        agentId,
        input,
        output,
        riskLevel: spec.riskLevel,
        approved: true,
        timestamp: new Date(),
        durationMs,
        success: true,
      };
      this.logs.push(log);

      return { success: true, output, durationMs };
    } catch (err: any) {
      const durationMs = Date.now() - start;

      const log: ToolLogEntry = {
        toolName: name,
        agentId,
        input,
        output: null,
        riskLevel: spec.riskLevel,
        approved: true,
        timestamp: new Date(),
        durationMs,
        success: false,
      };
      this.logs.push(log);

      return { success: false, output: null, error: err.message || 'Tool execution failed', durationMs };
    }
  }

  /**
   * Get all registered tools.
   */
  listTools(): ToolSpec[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a specific tool spec.
   */
  getTool(name: string): ToolSpec | undefined {
    return this.tools.get(name);
  }

  /**
   * Get tool execution logs.
   */
  getLogs(limit: number = 50): ToolLogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Get tool stats for monitoring.
   */
  getStats(): { name: string; calls: number; avgMs: number; status: string }[] {
    const statsMap = new Map<string, { calls: number; totalMs: number; errors: number }>();

    for (const log of this.logs) {
      const existing = statsMap.get(log.toolName) || { calls: 0, totalMs: 0, errors: 0 };
      existing.calls++;
      existing.totalMs += log.durationMs;
      if (!log.success) existing.errors++;
      statsMap.set(log.toolName, existing);
    }

    return Array.from(statsMap.entries()).map(([name, stats]) => ({
      name,
      calls: stats.calls,
      avgMs: Math.round(stats.totalMs / stats.calls),
      status: stats.errors > stats.calls * 0.3 ? 'warn' : 'ok',
    }));
  }

  /**
   * Get tool names for LLM context.
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get tool descriptions for LLM context.
   */
  getToolDescriptions(): string {
    return Array.from(this.tools.values())
      .filter(t => t.status === 'available')
      .map(t => `- **${t.name}**: ${t.description} [${t.riskLevel} risk]`)
      .join('\n');
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();

/**
 * Register all built-in tools.
 * Called at app initialization.
 */
export async function registerBuiltinTools(): Promise<void> {
  // Terminal tool
  toolRegistry.register(
    {
      name: 'terminal',
      description: 'Execute a shell command and return the output',
      inputSchema: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
      outputSchema: { type: 'object', properties: { stdout: { type: 'string' }, stderr: { type: 'string' }, exitCode: { type: 'number' } } },
      riskLevel: 'medium',
      requiresApproval: false,
      category: 'system',
      status: 'available',
    },
    async (input: { command: string }) => {
      // Use Electron IPC if available, otherwise simulate
      if (typeof window !== 'undefined' && (window as any).electronAPI?.executeTerminalCommand) {
        const result = await (window as any).electronAPI.executeTerminalCommand(input.command);
        return result;
      }
      return { type: 'info', content: `[Simulated] ${input.command}` };
    }
  );

  // File read tool
  toolRegistry.register(
    {
      name: 'file_read',
      description: 'Read the contents of a file from the local filesystem',
      inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
      outputSchema: { type: 'object', properties: { content: { type: 'string' } } },
      riskLevel: 'low',
      requiresApproval: false,
      category: 'filesystem',
      status: 'available',
    },
    async (input: { path: string }) => {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.readFile) {
        const content = await (window as any).electronAPI.readFile(input.path);
        return { content };
      }
      return { content: `[Simulated] Content of ${input.path}` };
    }
  );

  // File write tool
  toolRegistry.register(
    {
      name: 'file_write',
      description: 'Write content to a file on the local filesystem',
      inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] },
      outputSchema: { type: 'object', properties: { success: { type: 'boolean' } } },
      riskLevel: 'high',
      requiresApproval: true,
      category: 'filesystem',
      status: 'available',
    },
    async (input: { path: string; content: string }) => {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.writeFile) {
        await (window as any).electronAPI.writeFile(input.path, input.content);
        return { success: true };
      }
      return { success: false, error: 'Electron API not available' };
    }
  );

  // Directory listing tool
  toolRegistry.register(
    {
      name: 'list_directory',
      description: 'List the contents of a directory',
      inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
      outputSchema: { type: 'object', properties: { entries: { type: 'array', items: { type: 'string' } } } },
      riskLevel: 'low',
      requiresApproval: false,
      category: 'filesystem',
      status: 'available',
    },
    async (input: { path: string }) => {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.listDirectory) {
        const entries = await (window as any).electronAPI.listDirectory(input.path);
        return { entries };
      }
      return { entries: ['[Simulated] file1.txt', '[Simulated] file2.py'] };
    }
  );

  // Web search tool (using DuckDuckGo instant answers as free fallback)
  toolRegistry.register(
    {
      name: 'web_search',
      description: 'Search the web and return results',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      outputSchema: { type: 'object', properties: { results: { type: 'array' } } },
      riskLevel: 'low',
      requiresApproval: false,
      category: 'web',
      status: 'available',
    },
    async (input: { query: string }) => {
      try {
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(input.query)}&format=json&no_html=1`);
        const data = await response.json();
        const results = [];
        if (data.AbstractText) {
          results.push({ title: data.Heading, snippet: data.AbstractText, url: data.AbstractURL });
        }
        if (data.RelatedTopics) {
          for (const topic of data.RelatedTopics.slice(0, 5)) {
            if (topic.Text) {
              results.push({ title: topic.Text.slice(0, 60), snippet: topic.Text, url: topic.FirstURL });
            }
          }
        }
        return { results, query: input.query };
      } catch (err: any) {
        return { results: [], error: err.message, query: input.query };
      }
    }
  );

  // Summarize tool (uses the LLM itself)
  toolRegistry.register(
    {
      name: 'summarize',
      description: 'Summarize text content into a concise overview',
      inputSchema: { type: 'object', properties: { text: { type: 'string' }, style: { type: 'string', enum: ['brief', 'detailed', 'bullets'] } }, required: ['text'] },
      outputSchema: { type: 'object', properties: { summary: { type: 'string' } } },
      riskLevel: 'low',
      requiresApproval: false,
      category: 'text',
      status: 'available',
    },
    async (input: { text: string; style?: string }) => {
      // This would ideally call the LLM, but for now return the original
      const maxLen = input.style === 'brief' ? 200 : 500;
      return { summary: input.text.slice(0, maxLen) + (input.text.length > maxLen ? '...' : '') };
    }
  );

  // Classify tool
  toolRegistry.register(
    {
      name: 'classify',
      description: 'Classify text into categories',
      inputSchema: { type: 'object', properties: { text: { type: 'string' }, categories: { type: 'array', items: { type: 'string' } } }, required: ['text'] },
      outputSchema: { type: 'object', properties: { category: { type: 'string' }, confidence: { type: 'number' } } },
      riskLevel: 'low',
      requiresApproval: false,
      category: 'text',
      status: 'available',
    },
    async (input: { text: string; categories?: string[] }) => {
      const categories = input.categories || ['general', 'legal', 'accounting', 'coding', 'web', 'business'];
      // Simple keyword-based classification
      const { classifyDomain } = await import('./orchestrator');
      const domain = classifyDomain(input.text);
      return { category: categories.includes(domain) ? domain : categories[0], confidence: 0.7 };
    }
  );

  console.log(`[ToolRegistry] Registered ${toolRegistry.listTools().length} built-in tools`);
}
