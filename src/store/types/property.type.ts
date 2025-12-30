export interface IProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  landlordId: string;
  slug: string;
}
