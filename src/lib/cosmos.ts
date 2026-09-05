import { CosmosClient, Database, Container } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE;

if (!endpoint) {
  throw new Error("COSMOS_ENDPOINT is not defined");
}

if (!key) {
  throw new Error("COSMOS_KEY is not defined");
}

if (!databaseId) {
  throw new Error("COSMOS_DATABASE is not defined");
}

const globalForCosmos = globalThis as unknown as {
  cosmosClient?: CosmosClient;
};

export const cosmosClient =
  globalForCosmos.cosmosClient ??
  new CosmosClient({
    endpoint,
    key,
  });

if (process.env.NODE_ENV !== "production") {
  globalForCosmos.cosmosClient = cosmosClient;
}

export const cosmosDatabase: Database =
  cosmosClient.database(databaseId);

export function getCosmosContainer(
  containerName: string
): Container {
  return cosmosDatabase.container(containerName);
}
