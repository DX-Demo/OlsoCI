/*******************************************************************************
 * Copyright IBM Corp. 2017
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Constants} from '../../Constants';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/publishReplay';




@Injectable()
export class ConfigServiceService {

	// cache config results
	public config: Map<string, any> = new Map();


	constructor(private http: HttpClient) {

	}

	getConfig(name: string): Observable<any> {
		if (this.config.has(name)) {
			return Observable.of(this.config.get(name));
		}

		const possibleTenant = window.location.pathname.split('/')[1],
			baseUrl = possibleTenant.search(/\w{8}\-\w{4}\-\w{4}\-\w{4}\-\w{12}/) === 0 ? '/' + possibleTenant : '',
			apiUrl = (window.location.hostname === 'localhost') ? Constants.apiUrl : `${window.location.protocol}//${window.location.hostname}/api${baseUrl}`;

console.warn('config-service.service.ts: possible tenant is %o and base url is %o', possibleTenant, baseUrl);

		if (name === Constants.HEADER_CONFIG) {
			const headerId = '90d184ea-eb9c-4316-97a8-9d1ebc3029fc';
			return this.http.get(`${apiUrl}/delivery/v1/content/${headerId}`)
				.do(res => this.config.set(name, res))
				.publishReplay(1)
				.refCount();
		}

		if (name === Constants.FOOTER_CONFIG) {
			const footerId = 'ae72d304-ad18-4bf3-b213-4a79c829e458';
			return this.http.get(`${apiUrl}/delivery/v1/content/${footerId}`)
				.do(res => this.config.set(name, res))
				.publishReplay(1)
				.refCount();
		}

		const searchURL = `${apiUrl}/delivery/v1/search?q=name:%22${encodeURIComponent(name)}%22&fl=document:%5Bjson%5D`;
		return this.http.get(searchURL)
			.do((res) => {
				this.config.set(name, res);
			})
			.map((response: any) => {
				if (response && response.numFound > 0) {
					return response.documents.shift().document
				} else {
					return {};
				}
			})
			.publishReplay(1)
			.refCount();
	}

}
