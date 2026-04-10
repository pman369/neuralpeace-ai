-- Module content table: stores markdown sections for each module
CREATE TABLE public.module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  section_title TEXT NOT NULL,
  section_order INTEGER NOT NULL,
  content_md TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_module_content_module_id ON public.module_content(module_id);
CREATE INDEX idx_module_content_order ON public.module_content(module_id, section_order);

ALTER TABLE public.module_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access"
  ON public.module_content FOR SELECT USING (true);

-- Seed content for "Prefrontal Cortex Synthesis" (Neuroanatomy, Practitioner)
-- Maps to core_concepts.md Section 1: Neuroanatomy & Neurophysiology
INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Key Structures',
  1,
  '- **Hippocampus**: Memory consolidation, spatial navigation
- **Prefrontal Cortex**: Executive function, decision-making, working memory
- **Amygdala**: Emotional processing, fear conditioning
- **Basal Ganglia**: Motor control, habit formation, reward processing
- **Cerebellum**: Motor coordination, cognitive timing'
FROM public.modules WHERE title = 'Prefrontal Cortex Synthesis';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Synaptic Plasticity',
  2,
  '- **Long-Term Potentiation (LTP)**: NMDA receptor activation → Ca²⁺ influx → AMPA receptor trafficking
- **Long-Term Depression (LTD)**: Low-frequency stimulation → reduced synaptic strength
- **Role of NMDA Receptors**: Coincidence detectors requiring both glutamate binding and postsynaptic depolarization
- **Implications for Learning**: Hebbian plasticity ("fire together, wire together")'
FROM public.modules WHERE title = 'Prefrontal Cortex Synthesis';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Neurotransmitters',
  3,
  '| Neurotransmitter | Primary Functions | Associated Disorders |
|-----------------|-------------------|---------------------|
| Dopamine | Reward, motor control, motivation | Parkinson''s, Addiction, Schizophrenia |
| Serotonin | Mood regulation, sleep, appetite | Depression, Anxiety, OCD |
| Glutamate | Primary excitation, learning | Epilepsy, Excitotoxicity |
| GABA | Primary inhibition, anxiety reduction | Anxiety disorders, Epilepsy |
| Acetylcholine | Attention, memory, muscle activation | Alzheimer''s, Myasthenia Gravis |'
FROM public.modules WHERE title = 'Prefrontal Cortex Synthesis';

-- Seed content for "Bayesian Inference Models" (Computational, Expert)
INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Hodgkin-Huxley Model',
  1,
  '- **Voltage-Gated Ion Channels**: Na⁺ and K⁺ conductance equations
- **Action Potential Generation**: Threshold dynamics, refractory periods
- **Equations**:
  ```
  C_m * dV/dt = I_ext - g_Na * m³ * h * (V - E_Na) - g_K * n⁴ * (V - E_K) - g_L * (V - E_L)
  ```'
FROM public.modules WHERE title = 'Bayesian Inference Models';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Connectomics',
  2,
  '- **Diffusion Tensor Imaging (DTI)**: White matter tractography via water diffusion anisotropy
- **Human Connectome Project**: Whole-brain structural and functional mapping
- **Limitations**: Resolution gaps, dynamic vs. static connectivity, false positives in tractography'
FROM public.modules WHERE title = 'Bayesian Inference Models';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Bayesian Brain Theory',
  3,
  '- **Predictive Coding**: Brain as hierarchical inference machine
- **Free Energy Principle (Friston)**: Minimize variational free energy = minimize surprise
- **Applications**:
  - Perception as controlled hallucination
  - Active inference in motor control
  - Psychopathology as inference failure (delusions, hallucinations)
- **Mathematical Framework**: Markov blankets, generative models, KL divergence'
FROM public.modules WHERE title = 'Bayesian Inference Models';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'AI Integration',
  4,
  '- **Spiking Neural Networks (SNNs)**: Event-driven computation mimicking biological neurons
- **Neuromorphic Hardware**: Intel Loihi, IBM TrueNorth
- **Deep Learning Inspirations**: Convolutional networks from visual cortex architecture'
FROM public.modules WHERE title = 'Bayesian Inference Models';

-- Seed content for "fMRI Protocol Basics" (Methods, Novice)
INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'fMRI (Functional Magnetic Resonance Imaging)',
  1,
  '- **BOLD Signal**: Blood-oxygen-level-dependent contrast reflects neural activity indirectly
- **Spatial Resolution**: ~1-3mm voxels
- **Temporal Resolution**: ~1-2 seconds (limited by hemodynamic response)
- **Limitations**: Correlational, vascular confounds, reverse inference problems'
FROM public.modules WHERE title = 'fMRI Protocol Basics';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Electrophysiology',
  2,
  '- **Patch-Clamp Techniques**: Single-channel and whole-cell recordings
- **Local Field Potentials (LFPs)**: Population-level synaptic activity
- **EEG Waveforms**:
  - Delta (0.5-4 Hz): Deep sleep
  - Theta (4-8 Hz): Memory encoding, drowsiness
  - Alpha (8-13 Hz): Relaxed wakefulness
  - Beta (13-30 Hz): Active thinking, motor control
  - Gamma (30-100 Hz): Conscious perception, binding'
FROM public.modules WHERE title = 'fMRI Protocol Basics';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Optogenetics',
  3,
  '- **Channelrhodopsin-2 (ChR2)**: Blue-light activated cation channel
- **Halorhodopsin (NpHR)**: Yellow-light activated chloride pump (inhibition)
- **Applications**: Causal circuit mapping, behavior manipulation, disease models'
FROM public.modules WHERE title = 'fMRI Protocol Basics';

-- Seed content for "Cognitive Load Theory" (Psychology, Practitioner)
INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Working Memory Architecture',
  1,
  '- **Central Executive**: Attentional control, task switching, inhibition
- **Phonological Loop**: Verbal working memory, subvocal rehearsal
- **Visuospatial Sketchpad**: Visual and spatial information maintenance
- **Episodic Buffer**: Integration across subsystems and long-term memory
- **Capacity Limits**: 4±1 chunks (Cowan, 2001), revised from Miller''s 7±2'
FROM public.modules WHERE title = 'Cognitive Load Theory';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Types of Cognitive Load',
  2,
  '- **Intrinsic Load**: Inherent complexity of the material (element interactivity)
- **Extraneous Load**: Poor instructional design that wastes working memory
- **Germane Load**: Productive effort devoted to schema construction
- **Optimization Goal**: Minimize extraneous, manage intrinsic, maximize germane'
FROM public.modules WHERE title = 'Cognitive Load Theory';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Instructional Design Principles',
  3,
  '- **Worked Example Effect**: Replace problems with solved examples for novices
- **Split-Attention Effect**: Integrate related information sources spatially
- **Redundancy Effect**: Avoid presenting identical information in multiple formats
- **Expertise Reversal Effect**: Instructional methods effective for novices may hinder experts'
FROM public.modules WHERE title = 'Cognitive Load Theory';

-- Seed content for "Hippocampal Neurogenesis" (Neuroanatomy, Expert)
INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Adult Neurogenesis Locations',
  1,
  '- **Subgranular Zone (Dentate Gyrus)**: Primary site of adult neurogenesis
- **Subventricular Zone**: Neural stem cells migrate to olfactory bulb (rodents)
- **Wnt/β-Catenin Signaling**:
  - Proliferation control
  - Neuronal fate determination
  - Integration into existing circuits
- **Functional Role**: Pattern separation, mood regulation, memory flexibility
- **Controversy**: Extent in adult humans debated (DOI: 10.1016/j.cell.2018.03.011)'
FROM public.modules WHERE title = 'Hippocampal Neurogenesis';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Dendritic Spine Dynamics',
  2,
  '- **Actin Remodeling**: Rho GTPases (Rac1, Cdc42, RhoA) regulate spine morphology
- **Spine Types**:
  - Thin spines: Learning-ready, high turnover
  - Mushroom spines: Stable, memory storage
  - Stubby spines: Immature or transitioning
- **Timescales**:
  - Formation: Minutes to hours
  - Stabilization: Days to weeks
  - Elimination: Activity-dependent pruning'
FROM public.modules WHERE title = 'Hippocampal Neurogenesis';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'LTP Molecular Cascade',
  3,
  '- **Induction**: NMDA receptor activation → Ca²⁺ influx (10-100 μM locally)
- **Expression**:
  - Early LTP (1-3 hrs): AMPA receptor phosphorylation (GluA1 subunit)
  - Late LTP (hours-days): Protein synthesis, structural changes
- **Key Proteins**:
  - PSD-95: Scaffolding protein, AMPA receptor anchoring
  - CaMKII: Calcium/calmodulin-dependent kinase, autophosphorylation at T286
  - PKA/CREB: cAMP-dependent pathway, gene transcription'
FROM public.modules WHERE title = 'Hippocampal Neurogenesis';

-- Seed content for "Introduction to Neurofeedback" (Therapeutics, Novice)
INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'What is Neurofeedback?',
  1,
  'Neurofeedback is a type of biofeedback that uses real-time displays of brain activity (typically EEG) to teach self-regulation of neural function.

- **Operant Conditioning**: Brain receives feedback about its own activity
- **Goal**: Learn to modulate specific brainwave patterns voluntarily
- **Non-Invasive**: EEG sensors placed on scalp, no electrical stimulation
- **Applications**: Anxiety, ADHD, sleep disorders, peak performance training'
FROM public.modules WHERE title = 'Introduction to Neurofeedback';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'EEG Frequency Bands',
  2,
  '| Band | Frequency | Associated State |
|------|-----------|----------------|
| Delta | 0.5-4 Hz | Deep sleep |
| Theta | 4-8 Hz | Memory encoding, drowsiness |
| Alpha | 8-13 Hz | Relaxed wakefulness |
| Beta | 13-30 Hz | Active thinking, motor control |
| Gamma | 30-100 Hz | Conscious perception, binding |

Neurofeedback protocols target specific bands to achieve therapeutic goals.'
FROM public.modules WHERE title = 'Introduction to Neurofeedback';

INSERT INTO public.module_content (module_id, section_title, section_order, content_md)
SELECT
  id,
  'Clinical Applications',
  3,
  '- **ADHD**: Theta/Beta ratio training, evidence level: moderate
- **Anxiety**: Alpha-theta protocols, relaxation training
- **Sleep Disorders**: Sensorimotor rhythm (SMR) enhancement
- **Depression**: Frontal alpha asymmetry training
- **Peak Performance**: Flow state optimization for athletes and performers

**Evidence Status**: Promising but variable; strongest support for ADHD and epilepsy.'
FROM public.modules WHERE title = 'Introduction to Neurofeedback';
