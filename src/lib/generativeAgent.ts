/**
 * Generative Agent Logic
 * 
 * Handles parsing requests to generate new tools or scripts,
 * generating the code, and running it in the sandbox.
 */

import { executePython, executeNode, SandboxResult } from './sandbox';

export interface CodeGenerationResult {
  language: 'python' | 'javascript' | 'unknown';
  code: string;
}

/**
 * Extract code blocks from a generative agent response.
 */
export function extractCodeBlock(response: string): CodeGenerationResult {
  const pythonRegex = /```(?:python|py)\n([\s\S]*?)\n```/i;
  const jsRegex = /```(?:javascript|js|node)\n([\s\S]*?)\n```/i;

  const pyMatch = pythonRegex.exec(response);
  if (pyMatch) {
    return { language: 'python', code: pyMatch[1] };
  }

  const jsMatch = jsRegex.exec(response);
  if (jsMatch) {
    return { language: 'javascript', code: jsMatch[1] };
  }

  return { language: 'unknown', code: '' };
}

/**
 * Run generated code extracted from the agent's response.
 */
export async function runGeneratedCode(response: string): Promise<SandboxResult | null> {
  const { language, code } = extractCodeBlock(response);

  if (!code || language === 'unknown') {
    return null; // No valid executable code found
  }

  if (language === 'python') {
    return await executePython(code);
  }

  if (language === 'javascript') {
    return await executeNode(code);
  }

  return null;
}
