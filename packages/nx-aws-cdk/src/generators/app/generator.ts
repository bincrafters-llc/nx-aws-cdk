import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  Tree,
  updateJson,
  workspaceRoot,
} from '@nrwl/devkit';
import * as path from 'path';
import { NxAwsCdkGeneratorSchema } from './schema';
import initGenerator from '../init/generator';
import { Linter, lintProjectGenerator } from '@nrwl/linter';
import { jestProjectGenerator } from '@nrwl/jest';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';

interface NormalizedSchema extends NxAwsCdkGeneratorSchema {
  projectName: string;
  distRoot: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

export function normalizeOptions(
  tree: Tree,
  options: NxAwsCdkGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const distRoot = `${workspaceRoot}/dist`;
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    distRoot,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

function addJestFiles(host: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.projectName),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    host,
    path.join(__dirname, 'jest-files'),
    options.projectRoot,
    templateOptions
  );
}

async function addLintingToApplication(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  return await lintProjectGenerator(tree, {
    linter: options.linter,
    project: options.projectName,
    tsConfigPaths: [joinPathFragments(options.projectRoot, 'tsconfig.*?.json')],
    eslintFilePatterns: [`${options.projectRoot}/**/*.ts`],
    skipFormat: true,
    // setParserOptionsProject: options.setParserOptionsProject,
  });
}

export default async function (tree: Tree, options: NxAwsCdkGeneratorSchema) {
  const tasks: GeneratorCallback[] = [];
  const normalizedOptions = normalizeOptions(tree, options);
  const initTask = await initGenerator(tree, {
    ...options,
    skipFormat: true,
  });

  tasks.push(initTask);

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      bootstrap: {
        executor: '@bincrafters/nx-aws-cdk:bootstrap',
        options: {}
      },
      build: {
        executor: '@nrwl/js:tsc',
        options: {
          outputPath: `${normalizedOptions.distRoot}/apps/${normalizedOptions.projectName}`,
          main: `${normalizedOptions.projectRoot}/src/app.ts`,
          tsConfig: `${normalizedOptions.projectRoot}/tsconfig.app.json`,
          assets: ["libs/ts-lib/*.md"],
        }
      },
      deploy: {
        executor: '@bincrafters/nx-aws-cdk:deploy',
        options: {}
      },
      destroy: {
        executor: '@bincrafters/nx-aws-cdk:destroy',
        options: {}
      },
    },
    tags: normalizedOptions.parsedTags,
  });

  addFiles(tree, normalizedOptions);

  if (normalizedOptions.linter !== Linter.None) {
    const lintTask = await addLintingToApplication(tree, normalizedOptions);
    tasks.push(lintTask);
    updateLintConfig(tree, normalizedOptions);
  }

  if (normalizedOptions.unitTestRunner === 'jest') {
    const jestTask = await jestProjectGenerator(tree, {
      project: normalizedOptions.projectName,
      setupFile: 'none',
      skipSerializers: true,
      supportTsx: false,
      babelJest: false,
      testEnvironment: 'node',
      skipFormat: true,
    });
    tasks.push(jestTask);
    addJestFiles(tree, normalizedOptions);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

function updateLintConfig(tree: Tree, options: NormalizedSchema) {
    updateJson(tree, `${options.projectRoot}/.eslintrc.json`, (json) => {
      json.plugins = json?.plugins || [];
      const plugins: string[] = json.plugins;
  
      const hasCdkPlugin = plugins.findIndex((row) => row === 'cdk') >= 0;
      if (!hasCdkPlugin) {
        plugins.push('cdk');
      }
      return json;
    });
  }
