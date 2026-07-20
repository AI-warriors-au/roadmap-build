export interface RoadmapCatalogTag {
  slug: string;
  name: string;
}

export interface RoadmapCatalogItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: RoadmapCatalogTag[];
  topicCount: number;
  isEnrolled: boolean;
}

export interface ListRoadmapsResponse {
  items: RoadmapCatalogItem[];
}
