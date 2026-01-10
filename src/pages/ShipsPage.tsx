import "./ShipsPage.css";
import React, {useEffect, useState} from "react";
import { ComponentsTabs } from "./ComponentsTabs";
import {getShipComponents, type ShipComponentDtoReceive, updateShipComponents} from "../api/shipComponents";
import {createShip, deleteShipById, getShips, updateShipById, type ShipDtoReceive} from "../api/ships";
import {getComponentList} from "../hooks/getComponentList.ts";
type Stat = {
    label: string;
    mod: string;
    score: string;
};


export default function ShipsPage() {
    const [addedComponents, setAddedComponents] = useState<ShipComponentDtoReceive[]>([]);
    const [form, setForm] = useState({
        //Header
        name: "",
        size: "",
        length: 80,
        width: 20,

        // Stats
        strength: 19,
        dexterity: 7,
        constitution: 16,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,

        // General
        crewCapacity: 20,
        passengerCapacity: 20,
        cargoCapacity: 50,

        // Defenses
        damageImmunities: [] as string[],
        conditionImmunities: [] as string[],

        // Actions
        actionNumber: 3
    })
    const stats: Stat[] = [
        { label: "STRENGTH", mod: modFromScore(form.strength), score: String(form.strength) },
        { label: "DEXTERITY", mod: modFromScore(form.dexterity), score: String(form.dexterity) },
        { label: "CONSTITUTION", mod: modFromScore(form.constitution), score: String(form.constitution) },
        { label: "INTELLIGENCE", mod: modFromScore(form.intelligence), score: String(form.intelligence) },
        { label: "WISDOM", mod: modFromScore(form.wisdom), score: String(form.wisdom) },
        { label: "CHARISMA", mod: modFromScore(form.charisma), score: String(form.charisma) },
    ];

    const STAT_KEY: Record<Stat["label"], StatKey> = {
        STRENGTH: "strength",
        DEXTERITY: "dexterity",
        CONSTITUTION: "constitution",
        INTELLIGENCE: "intelligence",
        WISDOM: "wisdom",
        CHARISMA: "charisma",
    };

    const {data: componentData, status: componentStatus, error: _componentError, load: loadComponents} = getComponentList();

    // Helpers stats
    function modFromScore(score: number): string {
        if (score == 10) return "0";
        return String(Math.floor((score - 10) / 2));
    }
    type StatKey = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
    function setStatScore(key: StatKey, raw: string) {
        const n = Number(raw);
        const value = Number.isFinite(n) ? n : 0;

        setForm((f) => ({
            ...f,
            [key]: value,
        }));
    }

    // Helpers actions
    function actionText(actionNumber: number, crewCapacity: number): string {
        const step = Math.floor(crewCapacity / (actionNumber + 1));
        const parts: string[] = [];

        for (let a = actionNumber - 1; a >= 1; a--) {
            const crew = step * (a + 1);
            parts.push(
                `only ${a} action${a > 1 ? "s" : ""} if it has fewer than ${crew} crew`
            );
        }
        const lastPart = parts.pop();
        return (
            ` ` +
            `It can take ${parts.join(", ")} ` +
            `and only 1 action if it has fewer than ${lastPart}. ` +
            `It can't take these actions if it has fewer than ${step} crew.`
        );

    }

    function shipToForm(c: ShipDtoReceive) {
        return {
            //Header
            name: c.name,
            size: c.size,
            length: c.length,
            width: c.width,

            // Stats
            strength: c.strength,
            dexterity: c.dexterity,
            constitution: c.constitution,
            intelligence: c.intelligence,
            wisdom: c.wisdom,
            charisma: c.charisma,

            // General
            crewCapacity: c.crewCapacity,
            passengerCapacity: c.passengerCapacity,
            cargoCapacity: c.cargoCapacity,

            // Defenses
            damageImmunities: c.damageImmunities,
            conditionImmunities: c.conditionImmunities,

            // Actions
            actionNumber: c.actionNumber
        }
    }
    function resetForm(){
        setForm({
            //Header
            name: "",
            size: "",
            length: 80,
            width: 20,

            // Stats
            strength: 19,
            dexterity: 7,
            constitution: 16,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,

            // General
            crewCapacity: 20,
            passengerCapacity: 20,
            cargoCapacity: 50,

            // Defenses
            damageImmunities: [] as string[],
            conditionImmunities: [] as string[],

            // Actions
            actionNumber: 3
        })
        setAddedComponents([])
    }

    function filterShipComponents(shipComponentData: ShipComponentDtoReceive[]): ShipComponentDtoReceive[] {
        const byTypeId = new Map(
            componentData.map(item => [item.componentTypeId, item])
        );
        console.log(shipComponentData);
        console.log(componentData);

        return shipComponentData
            .map(aItem => {
                const bItem = byTypeId.get(aItem.componentTypeId);
                if (!bItem) return null;

                return {
                    ...bItem,
                    quantity: aItem.quantity,
                    id: aItem.id,
                };
            })
            .filter((x): x is ShipComponentDtoReceive => x !== null);
    }


    // Load
    const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
    const [_error, setError] = useState<string>("");
    const [data, setData] = useState<ShipDtoReceive[]>([]);

    // Create
    const [_createStatus, setCreateStatus] = useState<"idle" | "saving" | "updating" | "error">("idle");
    const [_createError, setCreateError] = useState<string>("");

    // Edit
    const [editingId, setEditingId] = useState<string | null>(null);

    // Action status
    const [actionStatus, setActionStatus] = useState<"idle" | "saving" | "deleting">("idle");

    // Component adder
    function addShipComponent(newComponent: ShipComponentDtoReceive) {
        setAddedComponents(prev => {
            const idx = prev.findIndex(c => c.componentTypeId === newComponent.componentTypeId);

            if (idx === -1) {
                return [...prev, { ...newComponent, quantity: 1}];
            }

            const next = [...prev];
            next[idx] = {
                ...next[idx],
                quantity: next[idx].quantity + 1
            };
            return next;
        });
    }
    async function load() {
        setStatus("loading");
        setError("");

        try {
            const res = await getShips();
            setData(res);
            setStatus("ok");
        } catch (e: any) {
            setError(String(e?.message ?? e));
            setStatus("error");
        }
    }

    async function loadComponentsForShip(shipId: string): Promise<ShipComponentDtoReceive[]> {
        setStatus("loading");
        setError("");

        try {
            const res = await getShipComponents(shipId);
            setStatus("ok");
            return res;
        } catch (e: any) {
            setError(String(e?.message ?? e));
            setStatus("error");
        }
        return [] as ShipComponentDtoReceive[];
    }

    async function onEdit(c: ShipDtoReceive) {
        setEditingId(c.id);
        setCreateStatus("updating");
        setCreateError("")
        resetForm();
        setForm(shipToForm(c));
        const shipComponentData = await loadComponentsForShip(String(c.id));

        setAddedComponents(filterShipComponents(shipComponentData));
    }

    function cancelEdit() {
        setEditingId(null);
        setCreateStatus("idle");
        setCreateError("");
        resetForm();
    }

    async function onDelete() {
        if (editingId){
            setActionStatus("deleting");
            console.log(`deleting: ${editingId}`);
            try {
                await deleteShipById(editingId);
                setEditingId(null)
                await load();
            } catch (e: any) {
                setError(e?.message ?? e);
                setStatus("error");
            } finally {
                setActionStatus("idle");
            }
        }
    }

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateStatus("saving");
        setActionStatus("saving");
        setCreateError("")
        const dataToSend = {
            name: form.name.trim(),
            size: form.size.trim(),
            length: Number(form.length),
            width: Number(form.width),

            // Stats
            strength: Number(form.strength),
            dexterity: Number(form.dexterity),
            constitution: Number(form.constitution),
            intelligence: Number(form.intelligence),
            wisdom: Number(form.wisdom),
            charisma: Number(form.charisma),

            // General
            crewCapacity: Number(form.crewCapacity),
            passengerCapacity: Number(form.passengerCapacity),
            cargoCapacity: Number(form.cargoCapacity),

            // Defenses
            damageImmunities: form.damageImmunities,
            conditionImmunities: form.conditionImmunities,

            // Actions
            actionNumber: Number(form.actionNumber),
        }

        try {
            if (editingId) {
                const createdShip:ShipDtoReceive = await updateShipById(editingId, dataToSend);
                setEditingId(createdShip.id);
                await updateShipComponents(editingId, addedComponents);
                setEditingId(null);
            } else {
                await createShip(dataToSend);
            }

            resetForm();

            await load();
        } catch (e: any) {
            setCreateError(String(e?.message ?? e));
            setCreateError("error");
        } finally {
            setActionStatus("idle");
        }
    }

    // Start
    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        loadComponents();
    }, [loadComponents]);


    return (
        <div>
            <div className="shipsPage">
                <div className="spSideCard spSideLeft">
                    <div className="spSideHeader">
                        <div className="spSideTitle">Ship Library</div>
                    </div>

                    <div className="spSideBody">
                        {status === "loading" && <div>Loading…</div>}
                        {status === "ok" && data.length === 0 && <div>No ships found.</div>}
                        {status === "ok" && data.length > 0 && (
                            <div className="spSideList">
                                {data.map((c) => (
                                    <div key={c.id} className="spSideItem">
                                        <div className="spSideItemTitle">
                                            <strong>{c.name}</strong>
                                        </div>

                                        <div className="spSideItemMeta">
                                            {c.length} ft. by {c.width} ft. vehicle
                                        </div>

                                        <div className="spSideItemActions">
                                            <button
                                                type="button"
                                                className="spBtn"
                                                disabled={actionStatus !== "idle"}
                                                onClick={() => onEdit(c)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="SheetWrapper">
                    <div className="boatSheet">
                        {/* Header */}
                        <div className="headerWrapepr">

                            <div className="header">
                                <div className="titleBlock">
                                    <div className="title">
                                        <input className="borderlessInput"
                                               placeholder="Name"
                                               value={form.name}
                                               onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
                                        />
                                    </div>
                                    <div className="subtitle">
                                        <input className="borderlessInput textInput"
                                               size={3}
                                               inputMode={"text"}
                                               placeholder="Gargantuan"
                                               value={form.size}
                                               onChange={(e) => setForm((f) => ({...f, size: e.target.value}))}
                                        />
                                        vehicle (
                                        <input className="borderlessInput numericalInput"
                                               size={3}
                                               inputMode={"numeric"}
                                               placeholder="80"
                                               value={form.length}
                                               onChange={(e) => setForm((f) => ({
                                                   ...f,
                                                   length: Number(e.target.value)
                                               }))}
                                        />
                                        ft. by
                                        <input className="borderlessInput numericalInput"
                                               size={3}
                                               inputMode={"numeric"}
                                               placeholder="20"
                                               value={form.width}
                                               onChange={(e) => setForm((f) => ({...f, width: Number(e.target.value)}))}
                                        />
                                        ft.)

                                    </div>
                                </div>
                            </div>
                            <div className="headerActions">
                                <button type={"button"} className={"header__Button"}
                                        disabled={actionStatus !== "idle"}
                                        onClick={cancelEdit}
                                >
                                    New
                                </button>
                                <button type={"button"} className={"header__Button"}
                                        disabled={actionStatus !== "idle"}
                                        onClick={(e) => onCreate(e)}
                                >
                                    Save
                                </button>
                                <button type={"button"} className={"header__Button delete"}
                                        disabled={actionStatus !== "idle"}
                                        onClick={() => onDelete()}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Stat strip */}
                        <div className="statStrip">
                            <div className="statStripInner">
                                {stats.map((s) => (
                                    <div key={s.label} className="statCard">
                                        <div className="statLabel">{s.label}</div>
                                        <div className="statMod">{s.mod}</div>
                                        <div className="statScore">
                                            <input
                                                className="borderlessInput numericalInput statscoreInput"
                                                size={3}
                                                inputMode="numeric"
                                                value={form[STAT_KEY[s.label]]}
                                                onChange={(e) => setStatScore(STAT_KEY[s.label], e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Middle row */}
                        <div className="midRow">
                            {/* Info column */}
                            <div className="panel">
                                <div className="panelBody">
                                    <div className="section">
                                        <div className="sectionTag">General</div>
                                        <div className="sectionBox">
                                            <div className="sectionBoxInner">
                                                <b>Creature Capacity:</b>
                                                <input className="borderlessInput numericalInput"
                                                       size={3}
                                                       inputMode={"numeric"}
                                                       placeholder="20"
                                                       value={form.crewCapacity}
                                                       onChange={(e) => setForm((f) => ({
                                                           ...f,
                                                           crewCapacity: Number(e.target.value)
                                                       }))}
                                                />
                                                crew,
                                                <input className="borderlessInput numericalInput"
                                                       size={3}
                                                       inputMode={"numeric"}
                                                       placeholder="20"
                                                       value={form.passengerCapacity}
                                                       onChange={(e) => setForm((f) => ({
                                                           ...f,
                                                           passengerCapacity: Number(e.target.value)
                                                       }))}
                                                />
                                                passengers.
                                            </div>
                                            <div className="sectionBoxInner">
                                                <b>Cargo Capacity:</b>
                                                <input className="borderlessInput numericalInput"
                                                       size={3}
                                                       inputMode={"numeric"}
                                                       placeholder="20"
                                                       value={form.cargoCapacity}
                                                       onChange={(e) => setForm((f) => ({
                                                           ...f,
                                                           cargoCapacity: Number(e.target.value)
                                                       }))}
                                                />
                                                tons.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="section">
                                        <div className="sectionTag">Defenses</div>
                                        <div className="sectionBox">
                                            <div className="sectionBoxInner">
                                                <b>Damage Immunities: </b>
                                                <input className="borderlessInput textInput"
                                                       inputMode={"text"}
                                                       placeholder="Psychic"
                                                       value={form.damageImmunities}
                                                       onChange={(e) => setForm((f) => ({
                                                           ...f,
                                                           damageImmunities: Array.from(new Set(e.target.value.split(",").map(item => item.trim().toLowerCase())))
                                                       }))}
                                                />
                                            </div>
                                            <div className="sectionBoxInner">
                                                <b>Condition Immunities: </b>
                                                <input className="borderlessInput textInput"
                                                       inputMode={"text"}
                                                       placeholder="Poisoned"
                                                       value={form.conditionImmunities}
                                                       onChange={(e) => setForm((f) => ({
                                                           ...f,
                                                           conditionImmunities: Array.from(new Set(e.target.value.split(",").map(item => item.trim().toLowerCase())))
                                                       }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="section sectionLarge">
                                        <div className="sectionTag">Actions</div>
                                        <div className="sectionBox sectionBoxLarge">
                                            On its turn, the ship can take
                                            <input className="borderlessInput numericalInput"
                                                   size={2}
                                                   inputMode={"numeric"}
                                                   placeholder="3"
                                                   value={form.actionNumber}
                                                   onChange={(e) => setForm((f) => ({
                                                       ...f,
                                                       actionNumber: Number(e.target.value)
                                                   }))}
                                            />
                                            actions.
                                            <label>{actionText(form.actionNumber, form.crewCapacity)}</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="panelFooterTag">Info</div>
                            </div>

                            <div className="panel">
                                <div className="componentsBox">
                                    <ComponentsTabs components={addedComponents}/>
                                </div>
                                <div className="panelFooterTag">Components</div>
                            </div>
                        </div>

                        {/* Bottom Attunement (EMPTY as requested) */}
                        <div className="panel attunementPanel">
                            <div className="attunementBox"/>
                            <div className="panelFooterTag">Attunement</div>
                        </div>
                    </div>
                </div>
                <div className="spSideCard spSideRight">
                    <div className="spSideHeader">
                        <div className="spSideTitle">Component Library</div>
                    </div>

                    <div className="spSideBody">
                        {componentStatus === "loading" && <div>Loading…</div>}
                        {componentStatus === "ok" && componentData.length === 0 && <div>No components found.</div>}
                        {componentStatus === "ok" && componentData.length > 0 && (
                            <div className="spSideList">
                                {componentData.map((c) => (
                                    <div key={c.id} className="spSideItem">
                                        <div className="spSideItemTitle">
                                            <strong>{c.name}</strong>
                                        </div>

                                        <div className="spSideItemActions">
                                            <button
                                                type="button"
                                                className="spBtn"
                                                disabled={actionStatus !== "idle"}
                                                onClick={() => addShipComponent(c)}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}
