/**
 * Directed connection between two component ports.
 */
export interface Connection {
  id: string
  fromNodeId: string
  fromPortId: string
  toNodeId: string
  toPortId: string
}

/**
 * Creates a deterministic connection id from endpoints.
 */
export const createConnectionId = (
  fromNodeId: string,
  fromPortId: string,
  toNodeId: string,
  toPortId: string,
) => `${fromNodeId}:${fromPortId}->${toNodeId}:${toPortId}`
