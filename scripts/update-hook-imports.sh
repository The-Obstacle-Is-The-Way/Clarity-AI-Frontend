#!/bin/bash
# Script to update hook import paths after reorganization

echo "Updating hook import paths in test files..."

# Update common imports
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useBrainModel|@application/hooks/brain/useBrainModel|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useBrainVisualization|@application/hooks/brain/useBrainVisualization|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useClinicalContext|@application/hooks/clinical/useClinicalContext|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/usePatientData|@application/hooks/clinical/usePatientData|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useTreatmentPrediction|@application/hooks/clinical/useTreatmentPrediction|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useTheme|@application/hooks/ui/useTheme|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useVisualSettings|@application/hooks/ui/useVisualSettings|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useBlockingTransition|@application/hooks/ui/useBlockingTransition|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useSearchParams|@application/hooks/utils/useSearchParams|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@hooks/useAuditLog|@application/hooks/utils/useAuditLog|g'

# Update old application hook paths
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useBrainModel|@application/hooks/brain/useBrainModel|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useBrainVisualization|@application/hooks/brain/useBrainVisualization|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useClinicalContext|@application/hooks/clinical/useClinicalContext|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/usePatientData|@application/hooks/clinical/usePatientData|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useTreatmentPrediction|@application/hooks/clinical/useTreatmentPrediction|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/usePatients|@application/hooks/clinical/usePatients|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/usePatientDetail|@application/hooks/clinical/usePatientDetail|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useCreatePatient|@application/hooks/clinical/useCreatePatient|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useUpdatePatient|@application/hooks/clinical/useUpdatePatient|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useDeletePatient|@application/hooks/clinical/useDeletePatient|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useClinicalRecords|@application/hooks/clinical/useClinicalRecords|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useML|@application/hooks/clinical/useML|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useSentimentAnalysis|@application/hooks/clinical/useSentimentAnalysis|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useXGBoostPrediction|@application/hooks/clinical/useXGBoostPrediction|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useTheme|@application/hooks/ui/useTheme|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useVisualSettings|@application/hooks/ui/useVisualSettings|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useBlockingTransition|@application/hooks/ui/useBlockingTransition|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useSearchParams|@application/hooks/utils/useSearchParams|g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's|@application/hooks/useAuditLog|@application/hooks/utils/useAuditLog|g'

# Update runtime file imports for test files
find src -type f -name "*.runtime.test.ts" -o -name "*.runtime.test.tsx" | xargs sed -i '' 's|@hooks/\([a-zA-Z]*\)\.runtime|./\1.runtime|g'

echo "Import paths updated. You may need to manually check some files if they're still failing." 