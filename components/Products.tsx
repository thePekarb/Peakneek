"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Product } from "@/lib/types";

export default function ProductsBlock() {
  const [approved, setApproved] = useState<Product[]>([]);
  const [voting, setVoting] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", desc: "", is_lenten: false });
  const [myVotes, setMyVotes] = useState<Record<string, true>>({});

  const load = async () => {
    const { data: ap } = await supabase
      .from("products_view_with_votes")
      .select("*")
      .eq("status", "approved")
      .order("name");
    setApproved((ap || []) as Product[]);

    const { data: vt } = await supabase
      .from("products_view_with_votes")
      .select("*")
      .eq("status", "voting")
      .order("votes", { ascending: false });
    setVoting((vt || []) as Product[]);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: votes } = await supabase
        .from("product_votes")
        .select("product_id")
        .eq("user_id", user.id);

      const map: Record<string, true> = {};
      (votes as { product_id: string }[] | null)?.forEach(({ product_id }) => {
        map[product_id] = true;
      });
      setMyVotes(map);
    }
  };

  useEffect(() => { load(); }, []);

const vote = async (id: string) => {
  const { error } = await supabase.rpc("vote_for_product", { p_product_id: id });
  if (error) {
    alert(`Не удалось проголосовать: ${error.message}`);
  }
  await load();
};

  const propose = async () => {
    await supabase.from("products").insert({
      name: form.name,
      description: form.desc || null,
      is_lenten: form.is_lenten,
      status: "voting",
    });
    setForm({ name: "", desc: "", is_lenten: false });
    await load();
  };

  return (
    <div className="card">
      <h3 className="section-title">Продукты / Меню</h3>
      <div className="grid-2">
        <div>
          <h4 className="font-semibold mb-2">Утверждено</h4>
          <div className="space-y-2">
            {approved.map((p) => (
              <div key={p.id} className="container-glass p-3">
                <div className="font-medium">
                  {p.name} {p.is_lenten ? "(постное)" : ""}
                </div>
                {p.description && (
                  <div className="text-sm text-gray-700">{p.description}</div>
                )}
              </div>
            ))}
            {approved.length === 0 && (
              <div className="text-sm text-gray-700">Пока пусто.</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Голосование</h4>
          <div className="space-y-2 mb-4">
            {voting.map((p) => (
              <div key={p.id} className="container-glass p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">
                    {p.name} {p.is_lenten ? "(постное)" : ""}
                  </div>
                  {p.description && (
                    <div className="text-sm text-gray-700">{p.description}</div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">Голоса: {p.votes ?? 0}</div>
                </div>
                <button
                  className="btn-ghost"
                  disabled={!!myVotes[p.id]}
                  onClick={() => vote(p.id)}
                  title={myVotes[p.id] ? "Вы уже проголосовали" : "Проголосовать"}
                >
                  {myVotes[p.id] ? "✓" : "Голосовать"}
                </button>
              </div>
            ))}
            {voting.length === 0 && (
              <div className="text-sm text-gray-700">Нет активных голосований.</div>
            )}
          </div>

          <div className="container-glass p-3">
            <h4 className="font-semibold mb-2">Предложить продукт</h4>
            <div className="grid md:grid-cols-4 gap-2">
              <input
                className="input"
                placeholder="Название"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
              />
              <input
                className="input"
                placeholder="Краткое описание"
                value={form.desc}
                onChange={(e) =>
                  setForm((s) => ({ ...s, desc: e.target.value }))
                }
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_lenten}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, is_lenten: e.target.checked }))
                  }
                />
                Постное
              </label>
              <button className="btn-primary" onClick={propose}>
                Предложить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
