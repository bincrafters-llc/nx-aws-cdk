import { aws_cdk } from 'truemark-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';

/**
 * Base options for all stacks in the application.
 */
export interface BCStackOptions extends aws_cdk.ExtendedStackProps {
    envName: string;
}

/**
 * Base construct for all stacks in the application.
 * BC - Stand for BinCrafters
 */
export abstract class BCStack extends aws_cdk.ExtendedStack {
    protected constructor(scope: Construct, id: string, protected props?: BCStackOptions) {
        super(scope, id, props);
    }

    envSpecificName(name: string): string {
        return `${name}-${this.props.envName}`;
    }

    newExportParameter(id: string, name: string, value: string) {
        new ssm.StringParameter(this, this.envSpecificName(id), {
            parameterName: `${this.props.envName}/${name}`,
            stringValue: value,
          });
    }

    newOutputParameter(name: string, value: string, description?: string) {
        new cdk.CfnOutput(this, name, {
            value: value,
            exportName: this.envSpecificName(name),
            description: description
        });
    }
}
