import { Linter } from '@nrwl/linter';

export interface NxAwsCdkGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  skipFormat?: boolean;
  linter?: Linter;
  unitTestRunner?: 'jest' | 'none';
}
