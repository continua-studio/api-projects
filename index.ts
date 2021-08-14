import "reflect-metadata";
import aws from 'aws-serverless-express';
import awsMiddleware from 'aws-serverless-express/middleware';
import { graphqlHTTP } from 'express-graphql';
import express  = require('express');
import schema from './src';
// import cors from 'cors';
import bodyParser from 'body-parser';
const app = express();

// const corsOptions: cors.CorsOptions =
//   {allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Access-Control-Allow-Origin']};

/**
 * [schema description]
 * @type {[type]}
 */
// app.options('*', cors(corsOptions));
// app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(awsMiddleware.eventContext());


schema.then(s => {
  console.log(s);
  /**
   * Graphql as middleware
   * @type {[type]}
   */
  app.use('/', graphqlHTTP({
    schema:s,
    graphiql: !!(process.env.GRAPHIQL)
  }));
}).catch(e => {
  console.log(e)
});


/**
 * Lambda Proxy
 * @type {[type]}
 */
const server = aws.createServer(app);

// /**
//  * Lambda Entry
//  * @param  {[type]} event   [description]
//  * @param  {[type]} context [description]
//  * @return {[type]}         [description]
//  */
exports.handler = (event:any, context:any) => aws.proxy(server, event, context);
