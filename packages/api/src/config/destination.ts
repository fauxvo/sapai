import type { HttpDestination } from '@sap-cloud-sdk/connectivity';
import { env } from './environment.js';

export function createSapDestination(): HttpDestination {
  return {
    url: env.SAP_BASE_URL,
    username: env.SAP_USERNAME,
    password: env.SAP_PASSWORD,
    authentication: 'BasicAuthentication',
    sapClient: env.SAP_CLIENT,
    isTrustingAllCertificates: env.SAP_TRUST_ALL_CERTS,
  };
}

let destination: HttpDestination | undefined;

export function getSapDestination(): HttpDestination {
  if (!destination) {
    destination = createSapDestination();
  }
  return destination;
}
