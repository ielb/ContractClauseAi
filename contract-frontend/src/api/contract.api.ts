import { BaseAPI } from "@/api/base.api";

// Example types for contract API
interface Contract {
  id: string;
  title: string;
  content: string;
  status: "draft" | "active" | "expired";
  createdAt: string;
  updatedAt: string;
}

interface CreateContractDto {
  title: string;
  content: string;
}

interface UpdateContractDto {
  title?: string;
  content?: string;
  status?: "draft" | "active" | "expired";
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Example Contract API class demonstrating how to use the shared axios configuration
 * This class extends BaseAPI to inherit the shared axios instance and helper methods
 */
export class ContractAPI extends BaseAPI {
  private static instance: ContractAPI;

  private constructor() {
    super();
  }

  public static getInstance(): ContractAPI {
    if (!ContractAPI.instance) {
      ContractAPI.instance = new ContractAPI();
    }
    return ContractAPI.instance;
  }

  // Get all contracts with pagination
  public async getContracts(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: Contract[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.getPaginated<Contract>("/contracts", page, limit);
  }

  // Get contract by ID
  public async getContractById(id: string): Promise<Contract> {
    const response = await this.api.get<ApiResponse<Contract>>(
      `/contracts/${id}`
    );
    return response.data.data;
  }

  // Create new contract
  public async createContract(data: CreateContractDto): Promise<Contract> {
    const response = await this.api.post<ApiResponse<Contract>>(
      "/contracts",
      data
    );
    return response.data.data;
  }

  // Update contract
  public async updateContract(
    id: string,
    data: UpdateContractDto
  ): Promise<Contract> {
    const response = await this.api.put<ApiResponse<Contract>>(
      `/contracts/${id}`,
      data
    );
    return response.data.data;
  }

  // Delete contract
  public async deleteContract(id: string): Promise<void> {
    await this.api.delete(`/contracts/${id}`);
  }

  // Upload contract file
  public async uploadContractFile(
    contractId: string,
    file: File
  ): Promise<Contract> {
    const response = await this.uploadFile(
      `/contracts/${contractId}/upload`,
      file,
      {
        contractId,
      }
    );
    return (response as { data: { data: Contract } }).data.data;
  }

  // Download contract as PDF
  public async downloadContractPDF(
    id: string,
    filename?: string
  ): Promise<Blob> {
    return this.downloadFile(
      `/contracts/${id}/pdf`,
      filename || `contract-${id}.pdf`
    );
  }

  // Search contracts
  public async searchContracts(
    query: string,
    page: number = 1,
    limit: number = 10,
    status?: "draft" | "active" | "expired"
  ): Promise<{
    data: Contract[];
    total: number;
    page: number;
    limit: number;
  }> {
    const additionalParams: Record<string, string | number | boolean> = {
      query,
    };
    if (status) {
      additionalParams.status = status;
    }

    return this.getPaginated<Contract>(
      "/contracts/search",
      page,
      limit,
      additionalParams
    );
  }
}
