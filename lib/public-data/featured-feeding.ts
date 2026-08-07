import { normalizeFeedDate } from "@/lib/public-data/feed-date";
import { respondWithPublicData } from "@/lib/public-data/availability";

export interface FeaturedFeedingPhoto {
  id: string;
  imageUrl: string;
  description: string;
  userName: string;
  location?: string;
  feedDate: string;
  animalCount?: number;
  source: "user";
}

export interface FeaturedFeedingDependencies {
  loadDocuments: () => Promise<unknown[]>;
  getImageUrl: (imageId: string) => string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toFeaturedFeedingPhoto(
  value: unknown,
  getImageUrl: (imageId: string) => string,
): FeaturedFeedingPhoto | null {
  if (!value || typeof value !== "object") return null;

  const document = value as Record<string, unknown>;
  const imageIds = document.imageIds;
  const feedDate = normalizeFeedDate(document.feedDate);

  if (
    !Array.isArray(imageIds)
    || !isNonEmptyString(imageIds[0])
    || !isNonEmptyString(document.$id)
    || !isNonEmptyString(document.description)
    || !isNonEmptyString(document.userName)
    || feedDate === null
  ) {
    return null;
  }

  const photo: FeaturedFeedingPhoto = {
    id: document.$id.trim(),
    imageUrl: getImageUrl(imageIds[0]),
    description: document.description.trim(),
    userName: document.userName.trim(),
    feedDate,
    source: "user",
  };

  if (isNonEmptyString(document.location)) {
    photo.location = document.location.trim();
  }

  if (
    typeof document.animalCount === "number"
    && Number.isInteger(document.animalCount)
    && document.animalCount > 0
  ) {
    photo.animalCount = document.animalCount;
  }

  return photo;
}

export async function createFeaturedFeedingResponse(
  dependencies: FeaturedFeedingDependencies,
  onError?: (error: unknown) => void,
): Promise<Response> {
  return respondWithPublicData(
    async () => {
      const documents = await dependencies.loadDocuments();
      const photos = documents
        .map((document) => toFeaturedFeedingPhoto(document, dependencies.getImageUrl))
        .filter((photo): photo is FeaturedFeedingPhoto => photo !== null)
        .reduce<FeaturedFeedingPhoto[]>((uniquePhotos, photo) => {
          if (!uniquePhotos.some((existing) => existing.imageUrl === photo.imageUrl)) {
            uniquePhotos.push(photo);
          }
          return uniquePhotos;
        }, []);

      return { photos };
    },
    "Featured feeding records are unavailable right now.",
    onError,
  );
}
