import { requestJson } from "../httpWrapper.ts";

// Template examples you will reuse for other endpoints:

export type ShipDtoReceive = {
    id: string;

    ownerUserId: string;

    // Header info
    name: string;
    size: string;
    length: number;
    width: number;

    // Stats
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;

    // General
    crewCapacity: number;
    passengerCapacity: number;
    cargoCapacity: number;

    // Defenses
    damageImmunities: string[];
    conditionImmunities: string[];

    // Actions
    actionNumber: number;
};


export type ShipDtoSend = {
    // Header info
    name: string;
    size: string;
    length: number;
    width: number;

    // Stats
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;

    // General
    crewCapacity: number;
    passengerCapacity: number;
    cargoCapacity: number;

    // Defenses
    damageImmunities: string[];
    conditionImmunities: string[];

};

export async function createShip(
    input: ShipDtoSend
): Promise<ShipDtoReceive> {
    return requestJson<ShipDtoReceive>("/api/ships/", {
        method: "POST",
        body: input
    });
}

export async function getShips(
): Promise<ShipDtoReceive[]> {
    return requestJson<ShipDtoReceive[]>("/api/ships/", {
        method: "GET",
    });
}

export async function updateShipById(
    shipId: string,
    input: ShipDtoSend
): Promise<ShipDtoReceive> {
    return requestJson<ShipDtoReceive>(`/api/ships/${shipId}`, {
        method: "PUT",
        body: input
    });
}

export async function getShipById(
    shipId: string,
): Promise<ShipDtoReceive> {
    return requestJson<ShipDtoReceive>(`/api/ships/${shipId}`, {
        method: "GET"
    });
}

export async function deleteShipById(
    shipId: string,
): Promise<ShipDtoReceive> {
    return requestJson<ShipDtoReceive>(`/api/ships/${shipId}`, {
        method: "DELETE"
    });
}

