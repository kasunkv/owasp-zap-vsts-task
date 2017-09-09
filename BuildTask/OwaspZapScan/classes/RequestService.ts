import * as Request from 'request';
import * as RequestPromise from 'request-promise';

export class RequestService {
    ExecuteScanResultQuery(requestOptions: Request.UriOptions & RequestPromise.RequestPromiseOptions): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            RequestPromise(requestOptions)
                .then((res: any) => {
                    resolve(res);
                })
                .error((err: any) => {
                    reject(err.message || err);
                });
        });
    }
}