export interface LambdaMicroserviceGeneratorSchema {
    name: string;
    tags?: string;
    directory?: string;
    skipFormat?: boolean;
    linter?: Linter;
    unitTestRunner?: 'jest' | 'none';
}