import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastService } from './components/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  ignoreBarHttpOptions = {}; // clone of httpOptions, but with headers to disable the loading bar

  // this cannot be used to reference ApiService in handleError, because it is overwritten in catchError
  static handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }

    // return an observable with a user-facing error message
    return throwError(error.error?.message || 'error.standard');
  }

  constructor(private http: HttpClient, private toastService: ToastService) {
    Object.assign(this.ignoreBarHttpOptions, this.httpOptions); // clone properties of original headers
    (this.ignoreBarHttpOptions as any).headers = (this.ignoreBarHttpOptions as any).headers.set('ignoreLoadingBar', '');
  }

  get(path: string, notifyOnError: boolean = true, ignoreLoadingBar: boolean = false) {
    const options = ignoreLoadingBar ? this.ignoreBarHttpOptions : {headers: {}};

    return this.http.get(`${environment.api_url}${path}`, options)
      .pipe(
        catchError((error) => {
          if (notifyOnError) {
            this.notifyUser(error);
          }
          return ApiService.handleError(error);
        })
      );
  }

  post(path: string, payload: object = {}, notifyOnError: boolean = true, ignoreLoadingBar: boolean = false) {
    const options: any = ignoreLoadingBar ? this.ignoreBarHttpOptions : this.httpOptions;

    return this.http.post(`${environment.api_url}${path}`, payload, options)
      .pipe(
        catchError((error) => {
          if (notifyOnError) {
            this.notifyUser(error);
          }
          return ApiService.handleError(error);
        })
      );
  }

  put(path: string, payload: object = {}, notifyOnError: boolean = true, ignoreLoadingBar: boolean = false) {
    const options = ignoreLoadingBar ? this.ignoreBarHttpOptions : this.httpOptions;

    return this.http.put(`${environment.api_url}${path}`, payload, options)
      .pipe(
        catchError((error) => {
          if (notifyOnError) {
            this.notifyUser(error);
          }
          return ApiService.handleError(error);
        })
      );
  }

  delete(path: string, notifyOnError: boolean = true, ignoreLoadingBar: boolean = false) {
    const options = ignoreLoadingBar ? this.ignoreBarHttpOptions : {headers: {}};

    return this.http.delete(`${environment.api_url}${path}`, options)
      .pipe(
        catchError((error) => {
          if (notifyOnError) {
            this.notifyUser(error);
          }
          return ApiService.handleError(error);
        })
      );
  }

  upload(path: string, files: FileList | File[], metadata?: any, notifyOnError: boolean = true) {
    // upload has Content-Type header "multipart/form-data" and so is handled differently than the json post calls
    // in the rest of the system
    const options = {
      headers: new HttpHeaders()
    };

    const formData = new FormData();
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    const fileArray = Array.from(files);
    for (const file of fileArray) {
        formData.append('files', file, file.name);
    }

    return this.http.post(`${environment.api_url}${path}`, formData, options)
      .pipe(
        catchError((error) => {
          if (notifyOnError) {
            this.notifyUser(error);
          }
          return ApiService.handleError(error);
        })
      );
  }

  notifyUser(error: HttpErrorResponse) {
    let message = 'error.standard';
    if (!environment.production && error.error.message) {
      message = `Error ${error.status}: ${error.error.message}`;
    }

    this.toastService.showDanger(message);
  }

}
