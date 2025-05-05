# Services Refactoring Notes

## Completed Changes

We've introduced a new organization structure for the `src/application/services` directory that better aligns with clean architecture principles and promotes better maintainability:

1. **Service Organization by Domain**:
   - Brain services remain in `brain/`
   - Clinical services remain in `clinical/`
   - New `biometric/` directory for biometric services
   - Temporal services remain in `temporal/`
   - Shared utilities remain in `shared/`

2. **Controllers vs Services Separation**:
   - New `controllers/` directory for UI-facing hooks and controllers
   - Subdirectories within controllers match domain structure:
     - `controllers/biometric/` 
     - `controllers/brain/`
     - `controllers/clinical/`
     - `controllers/orchestration/`
     - `controllers/temporal/`

3. **File Naming Conventions**:
   - Services now use kebab-case: `brain-model.service.ts`
   - Controllers now use kebab-case: `neural-activity.controller.ts`
   - Test files follow the same pattern: `neural-activity.controller.test.ts`

4. **Export Structure**:
   - Each directory has an `index.ts` file that exports its contents
   - The main `index.ts` exports everything in a structured way
   - Backward compatibility is maintained for existing imports

## Next Steps Required

Since we've only copied files to the new locations rather than moving them, the following additional steps would be required to complete the refactoring:

1. **Update Import Paths**:
   - Each moved controller file needs its imports updated to reference the new service locations
   - Example: `import { biometricService } from '@application/services/biometric/biometric.service';`

2. **Update External References**:
   - Any module that imports these controllers needs to be updated to reference the new locations
   - This could be automated with a find/replace tool

3. **Test Coverage**:
   - Tests that import controllers need their imports updated
   - All tests should be run to ensure functionality is maintained

4. **Remove Duplicates**:
   - Once the refactoring is verified, the old files can be removed
   - Verify the `clinicalService.ts` file is redundant before removing it

5. **Documentation Updates**:
   - Code owners files should be updated
   - ADR (Architecture Decision Record) should document this reorganization

## Benefits of New Structure

1. **Improves Developer Experience**:
   - Clear separation between services and controllers
   - Domain-driven directory structure matches mental model of system
   - Consistent naming conventions

2. **Enhances Maintainability**:
   - Files with similar concerns are grouped together
   - Smaller, more focused directories
   - Consistent naming conventions make file locations predictable

3. **Follows Clean Architecture**:
   - Clear separation of concerns
   - Services focused on business logic
   - Controllers focused on application/UI interactions

4. **Simplifies Testing**:
   - Tests colocated with implementation files
   - Clearer structure for what needs to be mocked

This refactoring follows the same pattern already established in the hooks directory, creating a consistent organizational structure throughout the application layer. 