import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';

describe('nx-aws-cdk app e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@bincrafters/nx-aws-cdk', 'dist/packages/nx-aws-cdk');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  // it('should create app', async () => {
  //   const project = uniq('nx-aws-cdk');
  //   await runNxCommandAsync(
  //     `generate @bincrafters/nx-aws-cdk:app ${project}`
  //   );
  //   const result = await runNxCommandAsync(`build ${project}`);
  //   expect(result.stdout).toContain('Executor ran');
  // }, 120000);

  describe('--directory', () => {
    it('should create src in the specified directory', async () => {
      const project = uniq('nx-aws-cdk');
      await runNxCommandAsync(
        `generate @bincrafters/nx-aws-cdk:app ${project} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`apps/subdir/${project}/src/app.ts`)
      ).not.toThrow();
    }, 120000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('nx-aws-cdk');
      ensureNxProject('@bincrafters/nx-aws-cdk', 'dist/packages/nx-aws-cdk');
      await runNxCommandAsync(
        `generate @bincrafters/nx-aws-cdk:app ${projectName} --tags e2etag,e2ePackage`
      );
      const project = readJson(`apps/${projectName}/project.json`);
      expect(project.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 120000);
  });
});
