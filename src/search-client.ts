/**
 * A client for interacting with the Alert Logic Search Public API.
 */
import { ALClient, APIRequestParams } from '@al/client';

export interface LogMessageSearchResult {
  fields: {
    ingest_id: string;
    message: string;
    metadata: {
      create_ts: number;
      data: string;
      meta_id: string;
      uuid: string;
    }[];
    pid: number;
    priority: number;
    time_recv: number;
    source_id: string;
    host_name: string;
    facility: string;
    program: string;
  };
  id: {
    account: number;
    aid: number;
    msgid: string;
  };
}

export interface SubmitSearchResponse {
  search_uuid: string;
  search_status: 'suspended' | 'pending' | 'complete' | 'failed';
  start_ts: number;
  update_ts: number;
  status_details: string;
  progress: number;
}

export interface FetchSearchResponse extends SubmitSearchResponse {
  results: LogMessageSearchResult[]; // In the future other message types can be returned, so not just Log Messages
  next_token?: string;
  estimated?: number;
  remaining?: number;
}

export interface SearchStatusResponse extends SubmitSearchResponse {
  query: string;
  search_type: 'batch' | 'interactive' | 'report';
}

export interface SearchResultsQueryParams {
  limit?: number;
  offset?: number;
  starting_token?: string;
}

class SearchClient {

  private alClient = ALClient;
  private serviceName = 'search';
  /**
   * Submit Search - starts the search query job in the backend
   */
  async submitSearch(accountId: string, dataType: string, searchQuery?: any) {
    const search = await this.alClient.post({
      service_name: this.serviceName,
      account_id: accountId,
      path: `/search/${dataType}`,
      data: searchQuery,
    });
    return search as SubmitSearchResponse;
  }

  /**
   * Fetch Search Results - Access the results of the submitted search
   */
  async fetchSearchResults(accountId: string, searchId: string, queryParams?: SearchResultsQueryParams) {
    const fetchRequestArgs: APIRequestParams = {
      service_name: this.serviceName,
      account_id: accountId,
      path: `/fetch/${searchId}`,
      ttl: 0,
    };
    if (queryParams) {
      fetchRequestArgs.params = queryParams;
    }
    const results = await this.alClient.fetch(fetchRequestArgs);
    return results as FetchSearchResponse;
  }

  /**
   * Fetch Search Results as CSV - Access the results of the submitted search in CSV format
   */
  async fetchSearchResultsAsCSV(accountId: string, searchId: string, queryParams?: SearchResultsQueryParams) {
    const fetchRequestArgs: APIRequestParams = {
      service_name: this.serviceName,
      account_id: accountId,
      path: `/fetch/${searchId}`,
      ttl: 0,
      accept_header: 'text/csv',
      response_type: 'blob',
    };
    if (queryParams) {
      fetchRequestArgs.params = queryParams;
    }
    const results = await this.alClient.fetch(fetchRequestArgs);
    return results;
  }

  /**
   * Search Status - Get latest status of the submitted search
   */
  async searchStatus(accountId: string, searchId: string) {
    const status = await this.alClient.fetch({
      service_name: this.serviceName,
      account_id: accountId,
      path: `/status/${searchId}`,
      ttl: 0,
    });
    return status as SearchStatusResponse;
  }

  /**
   * Release Search
   * Free resources occupied by a completed search. The resources are freed up.
   * Pending search is cancelled. Resources area also automatically released 24 hours after the search is completed
   */
  async releaseSearch(accountId: string, searchId: string) {
    const release = await this.alClient.post({
      service_name: this.serviceName,
      account_id: accountId,
      path: `/release/${searchId}`,
    });
    return release;
  }

  /**
   * Read Messages
   * Read a set of messages from storage by ID. Proxy for daccess service messages API. Only addition is logmsgs data type messages are also parsed and tokenised
   */
  async readMessages(accountId: string, messageIds: string[], fieldNames?: string[]) {
    const dataArgs = {
      ids: messageIds,
    };
    if (fieldNames) {
      dataArgs['fields'] = fieldNames;
    }
    const messages = await this.alClient.post({
      service_name: this.serviceName,
      account_id: accountId,
      path: '/messages/logmsgs',
      data: dataArgs,
    });
    return messages;
  }
}

export const searchClient =  new SearchClient();
