import { aws_cdk } from 'truemark-cdk-lib';

export abstract class BCApp extends aws_cdk.ExtendedApp {

    protected constructor(props?: aws_cdk.ExtendedAppProps) {
        super(props);
    }
}
