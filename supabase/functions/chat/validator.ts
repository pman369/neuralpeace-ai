import { ExpertiseLevel } from './types.ts';

const VALID_EXPERTISE_LEVELS: ExpertiseLevel[] = ['Novice', 'Practitioner', 'Expert', 'Scholar', 'Auto'];
const VALID_ROLES = ['system', 'user', 'assistant'];

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates the ChatRequest payload structure.
 * Returns an array of ValidationErrors, which will be empty if valid.
 */
export function validateChatRequest(body: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!body || typeof body !== 'object') {
    return [{ field: 'body', message: 'Request body must be a valid JSON object' }];
  }

  // Validate message
  if (body.message === undefined || body.message === null) {
    errors.push({ field: 'message', message: 'Message is required' });
  } else if (typeof body.message !== 'string') {
    errors.push({ field: 'message', message: 'Message must be a string' });
  } else if (body.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message cannot be empty' });
  } else if (body.message.length > 2000) {
    errors.push({ field: 'message', message: 'Message exceeds maximum length of 2000 characters' });
  }

  // Validate expertiseLevel
  if (body.expertiseLevel !== undefined) {
    if (!VALID_EXPERTISE_LEVELS.includes(body.expertiseLevel)) {
      errors.push({
        field: 'expertiseLevel',
        message: `Expertise level must be one of: ${VALID_EXPERTISE_LEVELS.join(', ')}`,
      });
    }
  }

  // Validate conversationHistory
  if (body.conversationHistory !== undefined) {
    if (!Array.isArray(body.conversationHistory)) {
      errors.push({ field: 'conversationHistory', message: 'Conversation history must be an array' });
    } else {
      if (body.conversationHistory.length > 50) {
        errors.push({ field: 'conversationHistory', message: 'Conversation history exceeds limit of 50 messages' });
      }
      
      body.conversationHistory.forEach((item: any, idx: number) => {
        if (!item || typeof item !== 'object') {
          errors.push({ field: `conversationHistory[${idx}]`, message: 'History item must be an object' });
          return;
        }
        
        if (item.role === undefined || !VALID_ROLES.includes(item.role)) {
          errors.push({
            field: `conversationHistory[${idx}].role`,
            message: `Role must be one of: ${VALID_ROLES.join(', ')}`,
          });
        }
        
        if (item.content === undefined || typeof item.content !== 'string') {
          errors.push({ field: `conversationHistory[${idx}].content`, message: 'Content must be a string' });
        } else if (item.content.length > 4000) {
          errors.push({ field: `conversationHistory[${idx}].content`, message: 'Content exceeds maximum length of 4000 characters' });
        }
      });
    }
  }

  // Validate stream
  if (body.stream !== undefined && typeof body.stream !== 'boolean') {
    errors.push({ field: 'stream', message: 'Stream must be a boolean value' });
  }

  return errors;
}
