"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ShoppingItem, ShoppingCheck } from "@/lib/types";

const color = (p: ShoppingItem["priority"]) =>
  p === "high" ? "bg-red-600" : p === "medium" ? "bg-yellow-500" : "bg-green-600";

export default function ShoppingListBlock() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [myId, setMyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("shopping_items")
      .select("*")
      .eq("approved", true)
      .order("priority");
    setItems((data ?? []) as ShoppingItem[]);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const uid = user?.id ?? null;
    setMyId(uid);

    if (uid) {
      const { data: ch } = await supabase
        .from("shopping_checks")
        .select("item_id, checked")
        .eq("user_id", uid);

      const map: Record<string, boolean> = {};
      (ch as Pick<ShoppingCheck, "item_id" | "checked">[] | null)?.forEach(
        ({ item_id, checked }) => {
          map[item_id] = !!checked;
        }
      );
      setChecks(map);
    } else {
      setChecks({});
    }
  };

  useEffect(() => {
    load();
  }, []);

  const propose = async () => {
    await supabase
      .from("shopping_items")
      .insert({ title, note: note || null });
    setTitle("");
    setNote("");
    await load();
  };

  const toggle = async (id: string) => {
    if (!myId) return;
    const val = !checks[id];
    setChecks((s) => ({ ...s, [id]: val }));
    if (val) {
      await supabase
        .from("shopping_checks")
        .upsert({ user_id: myId, item_id: id, checked: true });
    } else {
      await supabase
        .from("shopping_checks")
        .delete()
        .eq("user_id", myId)
        .eq("item_id", id);
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">Список покупок</h3>
      <div className="grid-3">
        {items.map((i) => (
          <label
            key={i.id}
            className="container-glass p-3 flex items-start gap-3"
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={!!checks[i.id]}
              onChange={() => toggle(i.id)}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{i.title}</div>
                <span
                  className={`px-2 py-1 rounded text-white text-xs ${color(
                    i.priority
                  )}`}
                >
                  {i.priority === "high"
                    ? "Высокий"
                    : i.priority === "medium"
                    ? "Средний"
                    : "Низкий"}
                </span>
              </div>
              {i.note && (
                <div className="text-sm text-gray-700 mt-1">{i.note}</div>
              )}
            </div>
          </label>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-gray-700">Пока пусто.</div>
        )}
      </div>

      <div className="mt-4 container-glass p-3">
        <h4 className="font-semibold mb-2">Предложить покупку</h4>
        <div className="grid md:grid-cols-3 gap-2">
          <input
            className="input"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="input"
            placeholder="Комментарий (необязательно)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn-primary" onClick={propose}>
            Отправить админу
          </button>
        </div>
      </div>
    </div>
  );
}
