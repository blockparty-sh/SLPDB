import * as dotenv from 'dotenv';
dotenv.config()

import * as grpc from 'grpc';
import { Config } from './config';
import { ControlServiceClient } from './proto/command_grpc_pb';
import * as command_pb from './proto/command_pb';
import { ArgumentParser } from 'argparse';



const parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'SLPDB Commander',
});

parser.addArgument(
    ['-r', '--reprocess'],
    {
        help: 'Reprocess a token and regenerate statistics',
        metavar: 'TOKENID'
    }
);

function connectToGrpcServer(): any {
    try {
        return new ControlServiceClient(Config.command_listener.url, grpc.credentials.createSsl());
    } catch (e) {
        console.error(e);
        console.log('Is your SLPDB server running and not currently catching up?');
    }
}

async function process(client: any, args: any) {
    if (! client) {
        return;
    }

    if (args.reprocess) {
        const tokenId = new command_pb.TokenId();
        tokenId.setTokenid(args.reprocess);

        client.reprocess(tokenId, (error: any, _: any) => {
            if (error) {
                console.error(error);
                return;
            }

            console.log('reprocess complete');
        });
    }
}

const client = connectToGrpcServer();
const args = parser.parseArgs();
process(client, args);
