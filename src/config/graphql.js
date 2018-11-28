import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import generalConfig from 'config/general';

/**
 * Client: graphQL 初始設定
 *
 * middleware & afterware => https://www.apollographql.com/docs/react/advanced/network-layer.html#linkMiddleware
 */
export const client = new ApolloClient({
	link: ApolloLink.from([
		// error log middleware
		onError(({ graphQLErrors, networkError }) => {
			if (graphQLErrors)
				graphQLErrors.map(({ message, locations, path }) =>
					console.error(
						`[GraphQL error]: Message: ${message}, Location: `,
						locations,
						`Path: `,
						path
					)
				);
			if (networkError) console.error(`[Network error]: ${networkError}`);
		}),

		// for graphql resource
		new createHttpLink({
			uri: `${generalConfig.api}/graphql`,
			credentials: 'include',
		}),
	]),
	cache: new InMemoryCache(),
});

/**
 * Fragment
 */
export const Fragments = {};

/**
 * Query
 */
