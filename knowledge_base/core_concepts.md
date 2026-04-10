# Core Concepts in Neuroscience: From Synaptic Mechanisms to Neuroethics

## 1. Neuroanatomy & Neurophysiology

### Key Structures
- **Hippocampus**: Memory consolidation, spatial navigation
- **Prefrontal Cortex**: Executive function, decision-making, working memory
- **Amygdala**: Emotional processing, fear conditioning
- **Basal Ganglia**: Motor control, habit formation, reward processing
- **Cerebellum**: Motor coordination, cognitive timing

### Synaptic Plasticity
- **Long-Term Potentiation (LTP)**: NMDA receptor activation → Ca²⁺ influx → AMPA receptor trafficking
- **Long-Term Depression (LTD)**: Low-frequency stimulation → reduced synaptic strength
- **Role of NMDA Receptors**: Coincidence detectors requiring both glutamate binding and postsynaptic depolarization
- **Implications for Learning**: Hebbian plasticity ("fire together, wire together")

### Neurotransmitters
| Neurotransmitter | Primary Functions | Associated Disorders |
|-----------------|-------------------|---------------------|
| Dopamine | Reward, motor control, motivation | Parkinson's, Addiction, Schizophrenia |
| Serotonin | Mood regulation, sleep, appetite | Depression, Anxiety, OCD |
| Glutamate | Primary excitation, learning | Epilepsy, Excitotoxicity |
| GABA | Primary inhibition, anxiety reduction | Anxiety disorders, Epilepsy |
| Acetylcholine | Attention, memory, muscle activation | Alzheimer's, Myasthenia Gravis |

## 2. Neuroimaging & Methods

### fMRI (Functional Magnetic Resonance Imaging)
- **BOLD Signal**: Blood-oxygen-level-dependent contrast reflects neural activity indirectly
- **Spatial Resolution**: ~1-3mm voxels
- **Temporal Resolution**: ~1-2 seconds (limited by hemodynamic response)
- **Limitations**: Correlational, vascular confounds, reverse inference problems

### Electrophysiology
- **Patch-Clamp Techniques**: Single-channel and whole-cell recordings
- **Local Field Potentials (LFPs)**: Population-level synaptic activity
- **EEG Waveforms**:
  - Delta (0.5-4 Hz): Deep sleep
  - Theta (4-8 Hz): Memory encoding, drowsiness
  - Alpha (8-13 Hz): Relaxed wakefulness
  - Beta (13-30 Hz): Active thinking, motor control
  - Gamma (30-100 Hz): Conscious perception, binding

### Optogenetics
- **Channelrhodopsin-2 (ChR2)**: Blue-light activated cation channel
- **Halorhodopsin (NpHR)**: Yellow-light activated chloride pump (inhibition)
- **Applications**: Causal circuit mapping, behavior manipulation, disease models

## 3. Computational Neuroscience

### Hodgkin-Huxley Model
- **Voltage-Gated Ion Channels**: Na⁺ and K⁺ conductance equations
- **Action Potential Generation**: Threshold dynamics, refractory periods
- **Equations**: 
  ```
  C_m * dV/dt = I_ext - g_Na * m³ * h * (V - E_Na) - g_K * n⁴ * (V - E_K) - g_L * (V - E_L)
  ```

### Connectomics
- **Diffusion Tensor Imaging (DTI)**: White matter tractography via water diffusion anisotropy
- **Human Connectome Project**: Whole-brain structural and functional mapping
- **Limitations**: Resolution gaps, dynamic vs. static connectivity, false positives in tractography

### AI Integration
- **Spiking Neural Networks (SNNs)**: Event-driven computation mimicking biological neurons
- **Neuromorphic Hardware**: Intel Loihi, IBM TrueNorth
- **Deep Learning Inspirations**: Convolutional networks from visual cortex architecture

## 4. Neurodegenerative Diseases

### Alzheimer's Disease
- **Pathology**: Amyloid-beta plaques, tau neurofibrillary tangles
- **Mechanisms**: Aβ oligomer toxicity, tau hyperphosphorylation → microtubule destabilization
- **Recent Treatments**: 
  - Lecanemab (Leqembi): Anti-Aβ monoclonal antibody, FDA approved 2023
  - Donanemab: Targets pyroglutamate Aβ, Phase 3 trials
- **Controversies**: Amyloid hypothesis debates, clinical significance of plaque reduction

### Parkinson's Disease
- **Pathology**: Dopaminergic neuron loss in substantia nigra pars compacta
- **Alpha-Synuclein**: Lewy body formation, prion-like propagation
- **Deep Brain Stimulation (DBS)**: 
  - Targets: Subthalamic nucleus (STN), Globus pallidus internus (GPi)
  - Mechanisms: Disruption of pathological beta oscillations (~13-30 Hz)

## 5. Neuroethics & Emerging Tech

### Brain-Computer Interfaces (BCIs)
- **Neuralink**: High-density electrode arrays, surgical robot implantation
- **Ethical Debates**: Cognitive enhancement, privacy of neural data, identity changes
- **Medical Applications**: Paralysis restoration, depression treatment, epilepsy prediction

### CRISPR in Neuroscience
- **Gene Targets**: APOE4 (Alzheimer's risk), HTT (Huntington's), SNCA (Parkinson's)
- **Off-Target Effects**: Unintended edits, mosaicism, delivery challenges
- **Ethical Concerns**: Germline editing, enhancement vs. therapy, equity of access

### AI Neuroethics
- **Bias in fMRI Datasets**: WEIRD samples (Western, Educated, Industrialized, Rich, Democratic)
- **Privacy in Neurodata**: Neural decoding of thoughts, mental privacy rights
- **Dual Use**: Military applications, cognitive manipulation

## Peer-Reviewed Sources

### Textbooks
- Kandel, E. R., et al. (2021). *Principles of Neural Science* (6th ed.). McGraw-Hill.
- Bear, M. F., Connors, B. W., & Paradiso, M. A. (2020). *Neuroscience: Exploring the Brain* (4th ed.). Wolters Kluwer.

### Key Journals
- Nature Neuroscience
- Neuron
- Journal of Neuroscience
- Brain
- Nature Reviews Neuroscience

### Representative DOIs
- Connectomics advances: 10.1038/s41593-023-01387-4
- Alzheimer's immunotherapy: 10.1056/NEJMoa2212948
- Optogenetics review: 10.1016/j.cell.2019.05.012

---

**Module Version:** 1.0  
**Last Updated:** March 2026
