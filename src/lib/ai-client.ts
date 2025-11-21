type BusinessType = "construction" | "trucking" | "restaurant";
type OptimizationType = "estimate" | "fleet" | "inventory";

export interface OptimizationRequest {
  prompt: string;
  businessType: BusinessType;
  optimizationType: OptimizationType;
  metadata?: Record<string, string | number | null | undefined>;
}

export interface OptimizationResponse {
  success: boolean;
  result: string;
  estimatedSavings: number;
  businessType: BusinessType;
  optimizationType: OptimizationType;
}

export async function requestOptimization(
  payload: OptimizationRequest,
): Promise<OptimizationResponse> {
  const { metadata, ...rest } = payload;
  const cleanedMetadata = cleanMetadata(metadata);

  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...rest,
      ...(cleanedMetadata ? { metadata: cleanedMetadata } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to reach the AI optimization service.");
  }

  const data = (await response.json()) as OptimizationResponse & {
    error?: string;
  };

  if (!data.success) {
    throw new Error(data.error || "Optimization request failed.");
  }

  return data;
}

function cleanMetadata(
  metadata: Record<string, string | number | null | undefined> | undefined,
) {
  if (!metadata) {
    return undefined;
  }

  const entries = Object.entries(metadata).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== Number.NaN,
  );

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries);
}
