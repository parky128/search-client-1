/**
 * A client for interacting with the Alert Logic Search Public API.
 */
import { ALClient, APIRequestParams } from '@alertlogic/client';

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
    return search;
  }

  /**
   * Fetch Search Results - Access the results of the submitted search
   */
  async fetchSearchResults(accountId: string, searchId: string, queryParams?: SearchResultsQueryParams) {
    const fetchRequestArgs: APIRequestParams = {
      service_name: this.serviceName,
      account_id: accountId,
      path: `/fetch/${searchId}`,
      ttl: 1,
    };
    if (queryParams) {
      fetchRequestArgs.params = queryParams;
    }
    const results = await this.alClient.fetch(fetchRequestArgs);
    return results;
  }

  /**
   * Fetch Search Results as CSV - Access the results of the submitted search in CSV format
   */
  async fetchSearchResultsAsCSV(accountId: string, searchId: string, queryParams?: SearchResultsQueryParams) {
    const fetchRequestArgs: APIRequestParams = {
      service_name: this.serviceName,
      account_id: accountId,
      path: `/fetch/${searchId}`,
      ttl: 1,
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
      ttl: 1,
    });
    return status;
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
