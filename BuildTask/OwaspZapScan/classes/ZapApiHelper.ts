import { TaskInput } from './TaskInput';
import * as RequestPromise from 'request-promise';
import * as Request from 'request';
import * as Task from 'vsts-task-lib';

export class ZapApiHelper {
    protected taskInputs: TaskInput;

    constructor(taskInputs: TaskInput) {
        this.taskInputs = taskInputs;
    }
    
    ClearZapSession(): Promise<number> {
        const statusOptions  = {
            zapapiformat: 'JSON',
            apikey: this.taskInputs.ZapApiKey,
            formMethod: 'GET'
        };

        const requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions = {
            // tslint:disable-next-line:no-http-string
            uri: `http://${this.taskInputs.ZapApiUrl}/JSON/core/action/newSession/`,
            qs: statusOptions
        };

        console.log('Clearing Zap Session...');
        Task.debug(`ZAP API Call: ${requestOptions.uri} | Request Options: ${JSON.stringify(statusOptions)}`);
        return this.MakeZapRequest(requestOptions, 'Successfully cleared Zap session');
   }

   MakeZapRequest(requestOptions: Request.UriOptions, successMessage: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        RequestPromise(requestOptions)
            .then((res: any) => {
                const result = JSON.parse(res);

                console.log(successMessage);
                Task.debug(`Status Result: ${JSON.stringify(res)}`);
                resolve(result.status);
            })
            .catch((err: any) => {
                reject(err.message || err);
            });
    });
   }
}