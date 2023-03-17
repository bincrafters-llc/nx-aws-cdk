import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  Tree,
} from '@nrwl/devkit';
import { InitGeneratorSchema } from './schema';
import { jestInitGenerator } from '@nrwl/jest';
import {
  CDK_CONSTRUCTS_VERSION,
  CDK_ESLINT_VERSION,
  CDK_VERSION,
} from '../../utils/cdk-shared';

function normalizeOptions(schema: InitGeneratorSchema) {
  return {
    ...schema,
    unitTestRunner: schema.unitTestRunner ?? 'jest',
  };
}

export default async function (tree: Tree, options: InitGeneratorSchema) {
  const normalizedOptions = normalizeOptions(options);
  let jestInstall: GeneratorCallback;

  if (normalizedOptions.unitTestRunner === 'jest') {
    jestInstall = await jestInitGenerator(tree, {});
  }

  const installTask = addDependenciesToPackageJson(
    tree,
    {
      'aws-cdk': CDK_VERSION,
      'aws-cdk-lib': CDK_VERSION,
      constructs: CDK_CONSTRUCTS_VERSION,
    },
    {
      'eslint-plugin-cdk': CDK_ESLINT_VERSION,
    }
  );

  if (!normalizedOptions.skipFormat) {
    await formatFiles(tree);
  }

  return async () => {
    if (jestInstall) {
      await jestInstall();
    }
    await installTask();
  };
}
