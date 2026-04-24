import { z } from 'zod';

export const SemanticScholarAuthorSchema = z.object({
  authorId: z.string().optional(),
  name: z.string()
}).passthrough();

export const SemanticScholarPaperSchema = z.object({
  paperId: z.string().optional(),
  title: z.string(),
  abstract: z.string().nullable().optional(),
  citationCount: z.number().optional(),
  influentialCitationCount: z.number().optional(),
  venue: z.string().nullable().optional(),
  year: z.number().nullable().optional(),
  authors: z.array(SemanticScholarAuthorSchema).optional(),
}).passthrough();

export const SemanticScholarResponseSchema = z.object({
  total: z.number().optional(),
  offset: z.number().optional(),
  data: z.array(SemanticScholarPaperSchema).optional(),
}).passthrough();
