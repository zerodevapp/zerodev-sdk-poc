import { IUserOperation } from "userop";

export interface CreateUserOpCall {
    to: string;
    value: string;
    data: string
}

export interface CreateUserOpRegularOptions {
    address: string,
    projectId: string,
    executionType: 'REGULAR' | 'DELEGATE',
    request: CreateUserOpCall
}

export interface CreateUserOpBatchOptions {
    address: string,
    projectId: string,
    executionType: 'BATCH',
    request: CreateUserOpCall[]
}

export type CreateUserOpOptions = CreateUserOpRegularOptions | CreateUserOpBatchOptions

export type GetCounterFactualAddressOptions = {
    address: string;
    projectId: string;
    index?: number
}

export type SendUserOpOptions = {
    userOp: IUserOperation, 
    projectId: string,
    waitTimeoutMs?: number,
    waitIntervalMs?: number,
    entryPointAddress?: string
}

export interface CreateRevokeSessionKeyUserOpOptions {
    address: string,
    projectId: string,
    publicSessionKey: string
}