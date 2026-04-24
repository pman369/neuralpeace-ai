import type { Citation } from '../ai';

export function getMockResponseText(level: string, topic: string): string {
  const responses: Record<string, string> = {
    Novice: `Great question! Let me break down "${topic}" in simple terms.\n\nThink of the brain like a complex city. Just as different neighborhoods have specialized roles (residential, commercial, industrial), different brain regions handle specific tasks. When you ask about **${topic}**, you're essentially asking about how one of these neighborhoods works.\n\nThe key idea is that your brain is constantly rewiring itself based on experience — a property called *neuroplasticity*. This means every time you learn something new, physical connections between neurons change.\n\n> 📚 **Further Reading**: Explore our Knowledge Base modules for deeper dives into specific topics.\n\n*This is an educational response. For health-related concerns, always consult a qualified healthcare professional.*`,

    Practitioner: `Here's a mechanistic explanation of **${topic}**.\n\nAt the systems level, this involves coordinated activity across multiple neural circuits. The primary mechanisms include:\n\n- **Synaptic plasticity**: LTP and LTD modify connection strengths based on activity patterns\n- **Neuromodulation**: Dopamine, serotonin, and other transmitters gate information flow\n- **Network oscillations**: Coordinated rhythms (theta, gamma) enable communication between distant regions\n\nThe current evidence suggests a multi-stage process: initial encoding relies on hippocampal-cortical dialogue, while consolidation involves systems-level reorganization during sleep.\n\n> 📚 **Key References**: See our citation database for peer-reviewed sources on this topic.\n\n*This is an educational response. For health-related concerns, always consult a qualified healthcare professional.*`,

    Expert: `Regarding **${topic}**, the current literature presents several competing frameworks.\n\n**Mechanistic Account:**\n\nThe dominant model posits that this phenomenon emerges from nonlinear interactions between:\n\n1. **Receptor-level dynamics**: NMDA/AMPA ratio determines plasticity thresholds, with metaplasticity modulated by prior activity history (BCM sliding threshold)\n2. **Intracellular cascades**: CaMKII autophosphorylation → CREB activation → BDNF transcription → structural remodeling\n3. **Network-level constraints**: Homeostatic plasticity (synaptic scaling) prevents runaway excitation\n\n**Methodological Critique:**\n\nMost evidence derives from rodent models with significant translational gaps. Human data relies heavily on correlational neuroimaging, and causal inference is limited. The field would benefit from:\n\n- Cross-species validation with homologous tasks\n- Convergent methods (TMS + fMRI + computational modeling)\n- Pre-registered replication studies\n\n**Open Debates:**\n\n- Whether observed effects reflect genuine plasticity or vascular confounds\n- The role of glial cells in modulating synaptic efficacy\n- Timescale mismatches between molecular and behavioral measures\n\n> 📚 **Representative DOIs**: Available in our citation database.\n\n*This is an educational response. For health-related concerns, always consult a qualified healthcare professional.*`,
  };

  return responses[level] ?? responses['Practitioner'];
}

export const mockCitations: Citation[] = [
  {
    title: 'Kandel, E. R., et al. (2021). Principles of Neural Science (6th ed.)',
    year: 2021,
  },
  {
    title: 'Bear, M. F., Connors, B. W., & Paradiso, M. A. (2020). Neuroscience: Exploring the Brain (4th ed.)',
    year: 2020,
  },
];
