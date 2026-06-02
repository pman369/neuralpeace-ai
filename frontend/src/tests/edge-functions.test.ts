import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectMedicalKeywords, judgeUserIntent } from '../../../supabase/functions/chat/guardrails';
import { getPersonaPrompt } from '../../../supabase/functions/chat/prompts';
import { detectExpertiseLevel } from '../../../supabase/functions/chat/lens';

describe('Edge Function: Chat - Guardrails', () => {
  describe('detectMedicalKeywords', () => {
    it('should detect clinical terms in lower or upper case', () => {
      expect(detectMedicalKeywords('Should I take ibuprofen?')).toBe(true);
      expect(detectMedicalKeywords('What is the diagnose?')).toBe(true);
      expect(detectMedicalKeywords('Tell me about action potentials')).toBe(false);
    });
  });

  describe('judgeUserIntent', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should call Gemini API and return classified intent', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                is_medical: false,
                intent: 'research',
                sentiment: 'curious',
                reasoning: 'Testing intent classification',
              }),
            },
          },
        ],
      };

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      vi.stubGlobal('fetch', fetchSpy);

      const result = await judgeUserIntent('How to design a patch clamp experiment?', 'mock-api-key');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.isMedical).toBe(false);
      expect(result.intent).toBe('research');
      expect(result.sentiment).toBe('curious');
    });

    it('should fallback to keyword detection on API error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      const result = await judgeUserIntent('should I take aspirin?', 'mock-api-key');
      expect(result.isMedical).toBe(true);
      expect(result.intent).toBe('general');
    });
  });
});

describe('Edge Function: Chat - Prompts', () => {
  it('should prioritize scientific intent over general expertise', () => {
    expect(getPersonaPrompt('Novice', 'research')).toContain('critical lab partner');
    expect(getPersonaPrompt('Expert', 'ethics')).toContain('neuroethics debate partner');
    expect(getPersonaPrompt('Novice', 'art')).toContain('poetic metaphors');
  });

  it('should fallback to expertise level prompts when no intent matched', () => {
    expect(getPersonaPrompt('Novice')).toContain('friendly neuroscience tutor');
    expect(getPersonaPrompt('Expert')).toContain('peer-level scholarly collaborator');
  });
});

describe('Edge Function: Chat - Lens (Expertise Detection)', () => {
  it('should classify expertise level based on Gemini response', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              level: 'Scholar',
              reasoning: 'Philosophical framing detected',
            }),
          },
        },
      ],
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', fetchSpy);

    const result = await detectExpertiseLevel('What are the neurophilosophical implications of free will?', 'mock-api-key');
    expect(result.level).toBe('Scholar');
    expect(result.reasoning).toBe('Philosophical framing detected');
  });
});
