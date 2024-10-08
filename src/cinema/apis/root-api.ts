/* tslint:disable */
/* eslint-disable */
/**
 * Cinema API
 * Watch videos together.
 *
 * OpenAPI spec version: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import globalAxios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Configuration } from '../configuration';
// Some imports not used depending on template conditions
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, RequestArgs, BaseAPI, RequiredError } from '../base';
import { ServerInfo } from '../models';
/**
 * RootApi - axios parameter creator
 * @export
 */
export const RootApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Index
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        indexGet: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
        /**
         * 
         * @summary Info
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        infoInfoGet: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/info`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, 'https://example.com');
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions :AxiosRequestConfig = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            const query = new URLSearchParams(localVarUrlObj.search);
            for (const key in localVarQueryParameter) {
                query.set(key, localVarQueryParameter[key]);
            }
            for (const key in options.params) {
                query.set(key, options.params[key]);
            }
            localVarUrlObj.search = (new URLSearchParams(query)).toString();
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: localVarUrlObj.pathname + localVarUrlObj.search + localVarUrlObj.hash,
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * RootApi - functional programming interface
 * @export
 */
export const RootApiFp = function(configuration?: Configuration) {
    return {
        /**
         * 
         * @summary Index
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async indexGet(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<any>>> {
            const localVarAxiosArgs = await RootApiAxiosParamCreator(configuration).indexGet(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
        /**
         * 
         * @summary Info
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async infoInfoGet(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => Promise<AxiosResponse<ServerInfo>>> {
            const localVarAxiosArgs = await RootApiAxiosParamCreator(configuration).infoInfoGet(options);
            return (axios: AxiosInstance = globalAxios, basePath: string = BASE_PATH) => {
                const axiosRequestArgs :AxiosRequestConfig = {...localVarAxiosArgs.options, url: basePath + localVarAxiosArgs.url};
                return axios.request(axiosRequestArgs);
            };
        },
    }
};

/**
 * RootApi - factory interface
 * @export
 */
export const RootApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    return {
        /**
         * 
         * @summary Index
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async indexGet(options?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
            return RootApiFp(configuration).indexGet(options).then((request) => request(axios, basePath));
        },
        /**
         * 
         * @summary Info
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async infoInfoGet(options?: AxiosRequestConfig): Promise<AxiosResponse<ServerInfo>> {
            return RootApiFp(configuration).infoInfoGet(options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * RootApi - object-oriented interface
 * @export
 * @class RootApi
 * @extends {BaseAPI}
 */
export class RootApi extends BaseAPI {
    /**
     * 
     * @summary Index
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    public async indexGet(options?: AxiosRequestConfig) : Promise<AxiosResponse<any>> {
        return RootApiFp(this.configuration).indexGet(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     * 
     * @summary Info
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof RootApi
     */
    public async infoInfoGet(options?: AxiosRequestConfig) : Promise<AxiosResponse<ServerInfo>> {
        return RootApiFp(this.configuration).infoInfoGet(options).then((request) => request(this.axios, this.basePath));
    }
}
