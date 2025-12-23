import type { CRUDService } from "@/types/common";
import api from "./api";

export class BaseService<
  T,
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
> implements CRUDService<T, TCreate, TUpdate> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAll(params?: any): Promise<T[]> {
    const response = await api.get(this.baseUrl, { params });
    return response.data;
  }

  async getById(id: string): Promise<T> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(data: TCreate): Promise<T> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: TUpdate): Promise<T> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}
