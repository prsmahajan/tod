export interface NamedPublicDataSource<T> {
  name: string;
  load: () => Promise<T[]>;
}

export interface AvailableSourceItems<T> {
  items: T[];
  failedSources: string[];
}

export class PublicDataUnavailableError extends Error {
  readonly failedSources: string[];
  readonly causes: unknown[];

  constructor(failures: Array<{ name: string; reason: unknown }>) {
    super("All public data sources are unavailable");
    this.name = "PublicDataUnavailableError";
    this.failedSources = failures.map((failure) => failure.name);
    this.causes = failures.map((failure) => failure.reason);
  }
}

export async function collectAvailableSourceItems<T>(
  sources: Array<NamedPublicDataSource<T>>,
): Promise<AvailableSourceItems<T>> {
  const results = await Promise.allSettled(sources.map((source) => source.load()));
  const failures = results.flatMap((result, index) => result.status === "rejected"
    ? [{ name: sources[index].name, reason: result.reason }]
    : []);

  const successfulResults = results.filter(
    (result): result is PromiseFulfilledResult<T[]> => result.status === "fulfilled",
  );

  if (successfulResults.length === 0) {
    throw new PublicDataUnavailableError(failures);
  }

  return {
    items: successfulResults.flatMap((result) => result.value),
    failedSources: failures.map((failure) => failure.name),
  };
}

export async function respondWithPublicData<T>(
  load: () => Promise<T>,
  unavailableMessage: string,
  onError?: (error: unknown) => void,
): Promise<Response> {
  try {
    return Response.json(await load());
  } catch (error) {
    onError?.(error);
    return Response.json(
      { error: unavailableMessage },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
