export type ArtTool = {
  id: string;
  artName: string;
  price: number;
  description: string;
  glassSurface: boolean;
  image: string;
  brand: string;
  limitedTimeDeal: number;
  comments?: {
    user: string;
    comment: string;
    rating: number;
    commentTime: string;
    userAvatar: string;
  }[];
};
