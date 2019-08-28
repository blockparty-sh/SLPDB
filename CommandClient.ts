import * as dotenv from 'dotenv';
dotenv.config()

import grpc = require('grpc');

import { Config } from './config';

const ControlService = grpc.load('command.proto').ControlService;

// @ts-ignore
const client = new ControlService(Config.command_listener.url, grpc.credentials.createInsecure);

client.reprocess({
    tokenId: '3b3dbc418af179bfa9832255e9cc4e4bb7abacde8da62881f6eb466cbf70cc66'
}, (error: any, _: any) => {
    if (error) {
        console.error(error);
        return;
    }

    console.log('reprocess complete');
});
