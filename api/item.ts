import { axiosInstance } from "@/api";
import { Item } from "@/type/item";

export namespace ItemApi {
  export async function getAll(filters?: Partial<Item>): Promise<Item[]> {
    try {
      const response = await axiosInstance.get<Item[]>("/artTool", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return [];
    }
  }

  export async function getById(id: string): Promise<Item | null> {
    try {
      const response = await axiosInstance.get<Item>(`/artTool/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
