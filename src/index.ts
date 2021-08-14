import {Arg, buildSchema, Mutation, Query, Resolver} from "type-graphql";
import {Project} from "./types/project";
import * as Sentry from "@sentry/node";
import {DynamoDB} from "aws-sdk";
import {v4} from "uuid";
import {AttributeMap} from "aws-sdk/clients/dynamodb";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: `api-projects:${process.env.LAMBDA_ENV}`
});

const dynamoService = new DynamoDB({apiVersion: '2012-08-10', region: process.env.AWS_REGION});
const dynamoClient = new DynamoDB.DocumentClient({service: dynamoService});

@Resolver(Project)
class ProjectResolver {

  /**
   *
   * @param id
   */
  @Query(returns => [Project])
  async getWorkspaceProjects(@Arg("id") id: string) {
    let query = {
      TableName: 'projects',
      IndexName: "sort_key-index",
      KeyConditionExpression: `#k = :sort_key`,
      ExpressionAttributeNames: {
        "#k": "sort_key"
      },
      ExpressionAttributeValues: {
        ":sort_key": id
      }
    };

    return ((await dynamoClient.query(query).promise()).Items || []).map(this.formatProject);
  }

  /**
   *
   * @param name
   * @param user_id
   */
  @Mutation(returns => Project)
  async createProject(@Arg("name") name: string, @Arg("workspace_id") user_id: string) {
    let params = {
      TableName: "workspaces",
      Item: {
        key: v4(),
        sort_key: user_id,
        name,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      }
    };

    await dynamoClient.put(params).promise();

    return {
      id: params.Item.key,
      name,
      created: params.Item.created,
      updated: params.Item.updated
    };
  }

  formatProject(w:AttributeMap) {
    return {id: w.key, workspace_id: w.sort_key, name: w.name, created: w.created, updated: w.updated}
  }
}

/**
 *
 */
export default buildSchema({
  resolvers: [ProjectResolver]
})
