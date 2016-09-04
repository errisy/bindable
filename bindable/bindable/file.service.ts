import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/observable/bindCallback';
import 'rxjs/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class FileService {
    constructor(private http: Http) {
        console.log('Http service:', http);
    }
    public GetFile(filelink: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            this.http.post(filelink, "").map(this.convertResponse)
                .subscribe(value => {
                    this.callback(value, data => {
                        observer.next(data);
                        observer.complete();
                    });
                });
        });
    }
    private callback(input: string, callback: (value: string) => void) {
        setTimeout(() => {
            callback(input + '\n callback invoked!');
        }, 500);
    }

    convertResponse(res: Response): string {
        return res.text();
    }
    jsonResponse(res: Response): Object {
        return res.json();
    }
}