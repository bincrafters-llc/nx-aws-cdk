import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { LambdaMicroserviceGeneratorSchema } from './schema';
import generateApp, { normalizeOptions as normalizeAppOptions } from '../app/generator';

interface NormalizedSchema extends LambdaMicroserviceGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function addFiles(tree: Tree, options: NormalizedSchema) {
    const templateOptions = {
      ...options,
      ...names(options.name),
      offsetFromRoot: offsetFromRoot(options.projectRoot),
      template: ''
    };
    generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export default async function (tree: Tree, options: LambdaMicroserviceGeneratorSchema) {
  const normalizedOptions = normalizeAppOptions(tree, options);
  await generateApp(tree, options);

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
