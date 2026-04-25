/**
 * Sandbox Execution Environment
 * 
 * Provides a safe way to execute dynamically generated Python and Node.js scripts.
 * Uses Electron IPC to run commands.
 */


export interface SandboxResult {
  success: boolean;
  output: string;
  error?: string;
  executionTimeMs: number;
}

/**
 * Execute Python code in a temporary sandbox file.
 */
export async function executePython(code: string): Promise<SandboxResult> {
  const start = Date.now();
  
  if (typeof window === 'undefined' || !(window as any).electronAPI) {
    return {
      success: false,
      output: '',
      error: 'Sandbox execution requires the Electron desktop environment.',
      executionTimeMs: Date.now() - start
    };
  }

  const { electronAPI } = window as any;
  const tempId = Math.random().toString(36).slice(2, 10);
  const tempPath = `./temp_script_${tempId}.py`;

  try {
    // Write code to temp file
    await electronAPI.writeFile(tempPath, code);

    // Execute the file
    const result = await electronAPI.executeTerminalCommand(`python "${tempPath}"`);

    // Clean up
    await electronAPI.executeTerminalCommand(
      navigator.userAgent.includes('Windows') ? `del "${tempPath}"` : `rm "${tempPath}"`
    );

    return {
      success: result.type !== 'error',
      output: result.type !== 'error' ? result.content : '',
      error: result.type === 'error' ? result.content : undefined,
      executionTimeMs: Date.now() - start
    };
  } catch (err: any) {
    return {
      success: false,
      output: '',
      error: err.message,
      executionTimeMs: Date.now() - start
    };
  }
}

/**
 * Execute Node.js code in a temporary sandbox file.
 */
export async function executeNode(code: string): Promise<SandboxResult> {
  const start = Date.now();
  
  if (typeof window === 'undefined' || !(window as any).electronAPI) {
    return {
      success: false,
      output: '',
      error: 'Sandbox execution requires the Electron desktop environment.',
      executionTimeMs: Date.now() - start
    };
  }

  const { electronAPI } = window as any;
  const tempId = Math.random().toString(36).slice(2, 10);
  const tempPath = `./temp_script_${tempId}.js`;

  try {
    // Write code to temp file
    await electronAPI.writeFile(tempPath, code);

    // Execute the file
    const result = await electronAPI.executeTerminalCommand(`node "${tempPath}"`);

    // Clean up
    await electronAPI.executeTerminalCommand(
      navigator.userAgent.includes('Windows') ? `del "${tempPath}"` : `rm "${tempPath}"`
    );

    return {
      success: result.type !== 'error',
      output: result.type !== 'error' ? result.content : '',
      error: result.type === 'error' ? result.content : undefined,
      executionTimeMs: Date.now() - start
    };
  } catch (err: any) {
    return {
      success: false,
      output: '',
      error: err.message,
      executionTimeMs: Date.now() - start
    };
  }
}
