import { OpenAPIHono } from '@hono/zod-openapi';
import { parseApp } from './parse.js';
import { parseStreamApp } from './parse-stream.js';
import { executeApp } from './execute.js';
import { conversationsApp } from './conversations.js';
import { historyApp } from './history.js';

export const agentApp = new OpenAPIHono();

agentApp.route('/', parseApp);
agentApp.route('/', parseStreamApp);
agentApp.route('/', executeApp);
agentApp.route('/', conversationsApp);
agentApp.route('/', historyApp);
