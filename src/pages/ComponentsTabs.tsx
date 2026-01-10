import { useMemo, useState } from "react";
import type {ShipComponentDtoReceive} from "../api/shipComponents.ts";
import "./ComponentsTabs.css";


type Props = {
    components: ShipComponentDtoReceive[];
    initialSelectedId?: string;
    emptyText?: string;
};

export function ComponentsTabs({
                                   components,
                                   initialSelectedId,
                                   emptyText = "No components added.",
                               }: Props) {
    const firstId = components[0]?.id;
    const defaultId = initialSelectedId ?? firstId ?? "";
    const [selectedId, setSelectedId] = useState<string>(defaultId);

    // If list changes and selected no longer exists, fallback to first
    const selected = useMemo(() => {
        const found = components.find((c) => c.id === selectedId);
        return found ?? components[0] ?? null;
    }, [components, selectedId]);

    // Keep selectedId valid when components array changes
    if (components.length > 0 && selected && selected.id !== selectedId) {
        setSelectedId(selected.id);
    }

    if (components.length === 0) {
        return <div className="ctEmpty">{emptyText}</div>;
    }

    function getHealthText(health: number, damageThreshold: number): string {
        if (damageThreshold === 0) {
            return `${health}`;
        } else {
            return `${health} (damage threshold: ${damageThreshold})`;
        }
    }

    function getFormatedDescription(description: string) {
        // Start of sentence to first ':'
        const match = description.match(/^[^.!?]+:/);
        if (!match) return description;

        const first = match[0];
        const rest = description.slice(first.length);
        const lines = rest
            .split(".")
            .map(s => s.trim())
            .filter(Boolean);

        return (
            <>
                <br/>

                <div className="ctDescriptionTitle">
                    <strong>{first}</strong>
                </div>
                <div className="ctDescriptionBody">
                    {lines.map((line, i) => (
                        <div key={i}>{line}.</div>
                    ))}
                </div>
            </>
        );
    }


    return (
        <div className="ctRoot">
            <div className="ctTabs" role="tablist" aria-label="Components">
                {components.map((c) => {
                    console.log(components.map(x => x.id));
                    const active = c.id === selected?.id;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            className={`ctTab ${active ? "isActive" : ""}`}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setSelectedId(c.id)}
                            title={c.name}
                        >
                            {c.name}
                        </button>
                    );
                })}
            </div>

            <div className="ctBody" role="tabpanel">
                <div className="ctTitle">{selected.type + ": " + selected.name}</div>
                <div className="ctHealth">
                    <b>Health Points:</b> {getHealthText(selected.health, selected.damageThreshold)}
                </div>
                <div className="ctQuantity">
                    <b>Quantity</b> {selected.quantity}
                </div>
                <br/>
                <div className="ctDescription">
                    {getFormatedDescription(selected.description)}
                </div>

            </div>
        </div>
    );
}
