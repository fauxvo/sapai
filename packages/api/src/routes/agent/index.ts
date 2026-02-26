import { OpenAPIHono } from '@hono/zod-openapi';
import { parseApp } from './parse.js';
import { parseStreamApp } from './parse-stream.js';
import { executeApp } from './execute.js';
import { conversationsApp } from './conversations.js';
import { historyApp } from './history.js';
import { runsApp } from './runs.js';
import { intentsApp } from './intents.js';

export const agentApp = new OpenAPIHono();

agentApp.route('/', parseApp);
agentApp.route('/', parseStreamApp);
agentApp.route('/', executeApp);
agentApp.route('/', conversationsApp);
agentApp.route('/', historyApp);
agentApp.route('/', runsApp);
agentApp.route('/', intentsApp);
