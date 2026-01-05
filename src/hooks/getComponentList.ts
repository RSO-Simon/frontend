import { useCallback, useState } from "react";
import {type ComponentDtoReceive, listComponentsForOwner} from "../api/components";
import type {ShipComponentDtoReceive} from "../api/shipComponents.ts";


export function getComponentList() {
    const [data, setData] = useState<ShipComponentDtoReceive[]>([]);
    const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
    const [error, setError] = useState("");

    function compToShipComp(component: ComponentDtoReceive): ShipComponentDtoReceive {
        return {
            ...component,
            shipId: "-1",
            quantity: 0,
            componentTypeId: component.id
        }
    }

    const load = useCallback(async () => {
        setStatus("loading");
        setError("");

        try {
            const res = await listComponentsForOwner();
            setData(res.map(compToShipComp));
            setStatus("ok");
        } catch (e: any) {
            setError(String(e?.message ?? e));
            setStatus("error");
        }
    }, []);

    return { data, status, error, load };
}