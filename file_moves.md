# Proposed File Organization Plan

## Directory Structure
Based on the current structure and domain organization, we should organize into these directories:

```
src/application/services/
├── __mocks__/                  # Mock services for testing
├── biometric/                  # Biometric-related services
├── brain/                      # Brain modeling services
├── clinical/                   # Clinical services
├── controllers/                # Controller components
│   ├── biometric/              # Biometric controllers
│   ├── brain/                  # Brain controllers
│   ├── clinical/               # Clinical controllers
│   ├── orchestration/          # Orchestration controllers
│   └── temporal/               # Temporal controllers
├── shared/                     # Shared utilities and services
└── temporal/                   # Temporal-related services
```

## File Moves

### Biometric Services
1. Move `biometricService.ts` → `biometric/biometric.service.ts`
2. Move `BiometricStreamController.ts` → `controllers/biometric/biometric-stream.controller.ts`
3. Move `BiometricStreamController.test.ts` → `controllers/biometric/biometric-stream.controller.test.ts`

### Brain Services
Keep current `brain/` directory structure:
- brain-model.service.ts
- brain-model.service.runtime.ts
- etc.

### New Brain Controllers
1. Move `NeuralActivityController.ts` → `controllers/brain/neural-activity.controller.ts`
2. Move `NeuralActivityController.test.ts` → `controllers/brain/neural-activity.controller.test.ts`

### Clinical Services
Keep current `clinical/` directory structure:
- clinical.service.ts
- risk-assessment.service.ts
- etc.

### Remove Redundant File
1. `clinicalService.ts` is redundant with `clinical/clinical.service.ts` and should be removed after verifying which one is actually used.

### New Clinical Controllers
1. Move `ClinicalPredictionController.ts` → `controllers/clinical/clinical-prediction.controller.ts`
2. Move `ClinicalPredictionController.test.ts` → `controllers/clinical/clinical-prediction.controller.test.ts`

### Orchestration Controllers
1. Move `NeuroSyncOrchestrator.ts` → `controllers/orchestration/neuro-sync.orchestrator.ts`
2. Move `NeuroSyncOrchestrator.test.ts` → `controllers/orchestration/neuro-sync.orchestrator.test.ts`

### Temporal Services
Keep current `temporal/` directory:
- temporal.service.ts
- etc.

### Temporal Controllers
1. Move `TemporalDynamicsController.ts` → `controllers/temporal/temporal-dynamics.controller.ts`
2. Move `TemporalDynamicsController.test.ts` → `controllers/temporal/temporal-dynamics.controller.test.ts`

## Required Updates
After moving files, these updates will be needed:

1. Create index.ts files in each new directory to re-export services
2. Update import paths in all moved files
3. Update all references to these services across the codebase
4. Update the main index.ts to properly export from the new structure 