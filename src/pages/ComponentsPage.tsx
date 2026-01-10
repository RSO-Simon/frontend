import "./ComponentsPage.css";

import { useEffect, useState } from "react";
import {createComponent, deleteComponentById, listComponentsForOwner, updateComponentById} from "../api/components.ts";
import type { ComponentDtoReceive} from "../api/components.ts";

export default function ComponentsPage() {
    // Create
    const [form, setForm] = useState({
        name: "",
        type: "",
        health: 1,
        damageThreshold: 0,
        armorClass: 10,
        description: "",
    });
    const [createStatus, setCreateStatus] = useState<"idle" | "saving" | "updating" | "error">("idle");
    const [createError, setCreateError] = useState<string>("");

    // Load
    const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
    const [error, setError] = useState<string>("");
    const [data, setData] = useState<ComponentDtoReceive[]>([]);

    // Edit
    const [editingId, setEditingId] = useState<string | null>(null);

    // Action status
    const [actionStatus, setActionStatus] = useState<"idle" | "saving" | "deleting">("idle");

    // Helpers
    function componentToForm(c: ComponentDtoReceive) {
        return {
            ownerUserId: String(c.ownerUserId ?? "1"), // remove if not in DTO
            name: c.name ?? "",
            type: c.type ?? "",
            health: Number(c.health ?? 1),
            damageThreshold: Number(c.damageThreshold ?? 0),
            armorClass: Number(c.armorClass ?? 10),
            description: c.description ?? "",
        }
    }

    function resetForm() {
        setForm({
            name: "",
            type: "",
            health: 1,
            damageThreshold: 0,
            armorClass: 10,
            description: "",
        });
    }

    function cancelEdit() {
        setEditingId(null);
        setCreateStatus("idle");
        setCreateError("");
        resetForm();
    }


    async function load() {
        setStatus("loading");
        setError("");

        try {
            const res = await listComponentsForOwner();
            setData(res);
            setStatus("ok");
        } catch (e: any) {
            setError(String(e?.message ?? e));
            setStatus("error");
        }
    }

    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setCreateStatus("saving");
        setActionStatus("saving");
        setCreateError("")
        const dataToSend = {
            name: form.name.trim(),
            type: form.type.trim(),
            health: Number(form.health),
            damageThreshold: Number(form.damageThreshold),
            armorClass: Number(form.armorClass),
            description: form.description.trim(),
        }
        try {
            if (editingId){
                await updateComponentById(editingId, dataToSend);
                setEditingId(null);
            } else {
                await createComponent(dataToSend);
            }

            resetForm();

            await load(); // refresh list
        } catch (e: any) {
            setCreateError(String(e?.message ?? e));
            setCreateStatus("error");
        } finally {
            setActionStatus("idle");
        }
    }

    function onEdit(c: ComponentDtoReceive) {
        setEditingId(c.id);
        setCreateStatus("updating");
        setCreateError("")
        setForm(componentToForm(c));
    }


    async function onDelete(id: string) {
        setActionStatus("deleting");
        try{
            await deleteComponentById(id);
            await load();
        } catch (e: any) {
            setError(e?.message ?? e);
            setStatus("error");
        } finally {
            setActionStatus("idle");
        }
    }


    useEffect(() => {
        load();
    }, []);

    return (
        <div style={{maxWidth: 1100, margin: "0 auto", padding: "24px 16px"}}>
            <div>
                {status === "error" && (
                    <pre style={{padding: 12, borderRadius: 8, background: "#111", color: "#ddd"}}>
                    {error}
                </pre>
                )}
                <div style={{display: "flex", gap: 32, alignItems: "flex-start"}}>
                    {/* LEFT: editor */}
                    <div style={{flex: 1}}>
                        <h3>{editingId ? `Editing component: ${editingId}` : "Create component"}</h3>
                        <form onSubmit={onCreate} style={{display: "grid", gap: 8, maxWidth: 520, marginBottom: 16}}>
                            <input
                                placeholder="Name"
                                value={form.name}
                                onChange={(e) => setForm((f) => ({...f, name: e.target.value}))}
                            />
                            <input
                                placeholder="Type"
                                value={form.type}
                                onChange={(e) => setForm((f) => ({...f, type: e.target.value}))}
                            />
                            <input
                                placeholder="Health"
                                type="number"
                                value={form.health}
                                onChange={(e) => setForm((f) => ({...f, health: Number(e.target.value)}))}
                            />
                            <input
                                placeholder="Damage Threshold"
                                type="number"
                                value={form.damageThreshold}
                                onChange={(e) => setForm((f) => ({...f, damageThreshold: Number(e.target.value)}))}
                            />
                            <input
                                placeholder="Armor Class"
                                type="number"
                                value={form.armorClass}
                                onChange={(e) => setForm((f) => ({...f, armorClass: Number(e.target.value)}))}
                            />
                            <textarea
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({...f, description: e.target.value}))}
                            />

                            <button type="submit" disabled={actionStatus !== "idle"}>
                                {actionStatus === "saving" ? "Saving..." : editingId ? "Update" : "Create"}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} disabled={actionStatus !== "idle"}>
                                    Cancel edit
                                </button>
                            )}
                            {createStatus === "error" && (
                                <pre style={{padding: 12, borderRadius: 8, background: "#111", color: "#ddd"}}>
                                {createError}
                            </pre>
                            )}
                        </form>
                    </div>
                    <div style={{width: 360}}>
                        <h3>Existing components</h3>
                        {status === "loading" && <div>Loading…</div>}
                        {status === "ok" && data.length === 0 && <div>No components found.</div>}
                        {status === "ok" && data.length > 0 && (
                            <div className="componentList">
                                    {data.map((c) => (
                                        <div key={c.id} className="componentCard">
                                            <div className="componentCard__title">
                                                <strong>{c.name}</strong> <span>({c.type})</span>
                                            </div>
                                            <div className="componentCard__meta">
                                                HP {c.health}, AC {c.armorClass}, DT {c.damageThreshold}
                                            </div>
                                            <div className="componentCard__actions">
                                                <button type={"button"} className={"componentCard__Button"} disabled={actionStatus !== "idle"}
                                                        onClick={() => onEdit(c)}>
                                                    Edit
                                                </button>
                                                <button type={"button"} className={"componentCard__Button"} disabled={actionStatus !== "idle"}
                                                        onClick={() => onDelete(c.id)}>
                                                    Delete
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
