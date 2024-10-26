import { axiosInstance } from "@/api";
import { ArtTool } from "@/type/art-tool";

export namespace ArtToolApi {
  export async function getAll(filters?: Partial<ArtTool>): Promise<ArtTool[]> {
    try {
      const response = await axiosInstance.get<ArtTool[]>("/artTool", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return [];
    }
  }

  export async function getById(id: string): Promise<ArtTool | null> {
    try {
      const response = await axiosInstance.get<ArtTool>(`/artTool/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
