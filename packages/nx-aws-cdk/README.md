# nx-aws-cdk

> note: This plugin is under ACTIVE development and is not ready to use yet

The idea behind this plugin to help as much as possible deploying infrastructure as code to AWS. 

# Generators

The following are common use cases we are going to implement in order to save us some typing andfcus on the business logic of our applications.

## CDK Application

bare CDK application that allow you to build you infrastructure from scratch. This generator can help you attach CDK to your NX repo. 

### Executors:
- Init
- Deploy
- Destroy

## Rest Microservice with DynamoDB

A common case when building microservice using AWS is to create a single Lambda function as an entrt point for your service. Based on the HTTP verb, the function can run different service methods that take care of the business logic. This generator not only creates your CDK app but it also create other classes and bare implementations for:

- DynamoDB table
- Reusable service to interact with DynamoDB
- Entry point Lambda function
- Validation Service using **Joi**
- Main service to interact with DynamoDB
- Common HTTP functions that help you with the API Gateway responses
- OpenAPI 3.x definition (pending ...)
- Script to generate OpenAPI definition on demand (pending ...)
- Script to generate API client for diferent languages (pending ...)

### Layout

This is the output from the generator (this is an opinionated output that hopefully make sense). Let's say we are creating a microservice for customers and we are running the following command:

`yarn nx generate @bincrafters/nx-aws-cdk:lambda-microservice infrastructure/customers --no-interactive `

This is how the layout would look like:

```
apps
|__ infrastructure
    |__ customers
        |__ core
                customers.service.ts  // business logic
                http.service.ts       // mainly helpers to help you with the HTTP responses
                table.service.ts      // service/repo to interact with DynamoDB
                validation.service.ts // service to help with payload validations
        |__ functions
                customers-function.ts // entry point to our service
        |__ stack
                api.ts                // Infrastructure code for lambda and dynamodb table
        app.test.ts
        app.ts                        // CDK app
```

### Executors:
- Init
- Deploy
- Destroy



## GraphQL Microservice with DynamoDB

...coming soon...


## REST Microservice from OpenAPI Definition

...coming soon...