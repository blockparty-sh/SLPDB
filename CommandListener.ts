import grpc = require('grpc');
import { Bit } from './bit';
import {Server, ServerCredentials, ServiceError } from 'grpc';
import { ControlServiceClient } from './proto/command_grpc_pb';
import * as command_pb from './proto/command_pb';


export class CommandListener {
    static init(url: string, bit: Bit) {
        const commandListener = new grpc.Server();

		// @ts-ignore
        commandListener.addService(ControlServiceClient, {
            reprocess: async function(request: command_pb.TokenId, callback: (error: grpc.ServiceError | null, response: command_pb.ReprocessResult) => void) {
                const tokenId = request.getTokenid_asU8().toString();
                let reprocessResult = new command_pb.ReprocessResult();

                if (bit.getSlpGraphManager().containsToken(tokenId)) {
                    bit.pauseProcessing();

                    while (bit.isProcessingQueueItems()) {
                        await new Promise(sleep => setTimeout(sleep, 100));
                    }

                    await bit.getSlpGraphManager().getToken(tokenId)!.updateStatistics();

                    bit.unpauseProcessing();

                    reprocessResult.setSuccess(true);
                    callback(null, reprocessResult);
                } else {
                    reprocessResult.setSuccess(false);
                    callback({
                        name: "NOT_FOUND",
                        message: "tokenId("+tokenId+") not found"
                    }, reprocessResult);
                }
            }
        });
        commandListener.bind(url, grpc.ServerCredentials.createInsecure());
        commandListener.start();
    }
}
