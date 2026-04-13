# Bayesian Inference Models

## Hodgkin-Huxley Model
- **Voltage-Gated Ion Channels**: Naâº and Kâº conductance equations
- **Action Potential Generation**: Threshold dynamics, refractory periods
- **Equations**:
  ```
  C_m * dV/dt = I_ext - g_Na * mÂ³ * h * (V - E_Na) - g_K * nâ´ * (V - E_K) - g_L * (V - E_L)
  ```

## Connectomics
- **Diffusion Tensor Imaging (DTI)**: White matter tractography via water diffusion anisotropy
- **Human Connectome Project**: Whole-brain structural and functional mapping
- **Limitations**: Resolution gaps, dynamic vs. static connectivity, false positives in tractography

## Bayesian Brain Theory
- **Predictive Coding**: Brain as hierarchical inference machine
- **Free Energy Principle (Friston)**: Minimize variational free energy = minimize surprise
- **Applications**:
  - Perception as controlled hallucination
  - Active inference in motor control
  - Psychopathology as inference failure (delusions, hallucinations)
- **Mathematical Framework**: Markov blankets, generative models, KL divergence

## AI Integration
- **Spiking Neural Networks (SNNs)**: Event-driven computation mimicking biological neurons
- **Neuromorphic Hardware**: Intel Loihi, IBM TrueNorth
- **Deep Learning Inspirations**: Convolutional networks from visual cortex architecture
