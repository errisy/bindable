import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class DogService {
    constructor(private http: Http) {
        
    }
    private listUrl = 'api/dog.js';
}