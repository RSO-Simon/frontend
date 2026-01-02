import {requestJson } from "./httpWrapper";

export type ShipComponentDtoReceive = {
    id: string;

    // Ownership
    shipId: string;

    // Component type reference
    componentTypeId: string;

    quantity: number;

    // Component data
    name: string;
    type: string;
    health: number;
    damageThreshold: number;
    armorClass: number;
    description: string;
};

export type ShipComponentDtoSend = {
    // Ownership
    shipId: string;

    // Component type reference
    componentTypeId: string;

    quantity: number;

    // Component data
    name: string;
    type: string;
    health: number;
    damageThreshold: number;
    armorClass: number;
    description: string;
};



export async function getShipComponents(
    shipId: string,
): Promise<ShipComponentDtoReceive[]> {
    return requestJson<ShipComponentDtoReceive[]>(`/api/ships/${shipId}/components`,{
        method: "GET",
    });
}

export async function createShipComponent(
    shipId: string,
    input: ShipComponentDtoSend
): Promise<ShipComponentDtoReceive> {
    return requestJson<ShipComponentDtoReceive>(`/api/ships/${shipId}`, {
        method: "POST",
        body: input
    });
}

export async function getShipComponentById(
    shipId: string,
    componentId: string,
): Promise<ShipComponentDtoReceive> {
    return requestJson<ShipComponentDtoReceive>(`/api/ships/${shipId}/components/${componentId}`, {
        method: "GET",
    });
}

export async function updateShipComponentById(
    shipId: string,
    componentId: string,
    input: ShipComponentDtoSend
): Promise<ShipComponentDtoReceive> {
    return requestJson<ShipComponentDtoReceive>(`/api/ships/${shipId}/components/${componentId}`, {
        method: "PUT",
        body: input
    });
}

export async function deleteShipComponentById(
    shipId: string,
    componentId: string,
): Promise<ShipComponentDtoReceive> {
    return requestJson<ShipComponentDtoReceive>(`/api/ships/${shipId}/components/${componentId}`, {
        method: "DELETE",
    });
}