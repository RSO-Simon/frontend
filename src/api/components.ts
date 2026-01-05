import { requestJson } from "../httpWrapper.ts";

export type ComponentDtoReceive = {
    id: string;

    ownerUserId: string;

    name: string;
    type: string;
    health: number;
    damageThreshold: number;
    armorClass: number;
    description: string;
};
export type ComponentDtoSend = {
    ownerUserId: string;

    name: string;
    type: string;
    health: number;
    damageThreshold: number;
    armorClass: number;
    description: string;
};

export async function listComponentsForOwner(
): Promise<ComponentDtoReceive[]> {
    return requestJson<ComponentDtoReceive[]>(`/api/components`);
}

export async function createComponent(
    input: ComponentDtoSend
): Promise<ComponentDtoReceive> {
    return requestJson<ComponentDtoReceive>(`/api/components`, {
        method: "POST",
        body: input
    });
}

export async function getComponentById(
    componentId: string,
): Promise<ComponentDtoReceive> {
    return requestJson<ComponentDtoReceive>(`/api/components/${componentId}`, {
        method: "GET",
    });
}

export async function updateComponentById(
    componentId: string,
    input: ComponentDtoSend
): Promise<ComponentDtoReceive> {
    return requestJson<ComponentDtoReceive>(`/api/components/${componentId}`, {
        method: "PUT",
        body: input
    });
}

export async function deleteComponentById(
    componentId: string,
): Promise<ComponentDtoReceive> {
    return requestJson<ComponentDtoReceive>(`/api/components/${componentId}`, {
        method: "DELETE",
    });
}