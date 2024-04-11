import { cancel, isCancel } from "@clack/prompts";

/**
 * @param {unknown} input clack's input Promise's value
 */
export function handleCancel(input) {
  if (isCancel(input)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }
}

