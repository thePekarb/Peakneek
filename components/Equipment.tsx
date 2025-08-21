"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Equipment } from "@/lib/types";

export default function EquipmentBlock() {
  const [available, setAvailable] = useState<Equipment[]>([]);
  const [mine, setMine] = useState<Equipment[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: av } = await supabase
      .from("equipment").select("*").eq("approved", true).is("taken_by", null).order("created_at");
    setAvailable((av || []) as Equipment[]);
    if (user) {
      const { data: my } = await supabase.from("equipment").select("*").eq("taken_by", user.id).order("created_at");
      setMine((my || []) as Equipment[]);
    }
  };

  useEffect(() => { load(); }, []);

  const take = async (id: string) => {
    setMessage(null);
    const { error } = await supabase.rpc("take_equipment", { p_equipment_id: id });
    if (error) setMessage(error.message);
    await load();
  };

  const ret = async (id: string) => {
    await supabase.rpc("return_equipment", { p_equipment_id: id });
    await load();
  };

  const propose = async () => {
    setMessage(null);
    const { error } = await supabase.from("equipment").insert({ name, image_url: image || null });
    if (error) setMessage(error.message);
    else { setName(""); setImage(""); setMessage("Отправлено на утверждение администратору."); }
  };

  return (
    <div className="card">
      <h3 className="section-title">Снаряжение</h3>
      <div className="grid-2">
        <div>
          <h4 className="font-semibold mb-2">Доступно</h4>
          <div className="space-y-2">
            {available.map((i) => (
              <div className="flex items-center gap-3 container-glass p-3" key={i.id}>
                {i.image_url && <img src={i.image_url} alt="" className="w-12 h-12 object-cover rounded-xl" />}
                <div className="flex-1"><div className="font-medium">{i.name}</div></div>
                <button className="btn-ghost" onClick={() => take(i.id)}>Взять</button>
              </div>
            ))}
            {available.length === 0 && <div className="text-sm text-gray-700">Пока нет доступных предметов.</div>}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Моё снаряжение</h4>
          <div className="space-y-2">
            {mine.map((i) => (
              <div className="flex items-center gap-3 container-glass p-3" key={i.id}>
                {i.image_url && <img src={i.image_url} alt="" className="w-12 h-12 object-cover rounded-xl" />}
                <div className="flex-1"><div className="font-medium">{i.name}</div></div>
                <button className="btn-ghost" onClick={() => ret(i.id)}>Вернуть</button>
              </div>
            ))}
            {mine.length === 0 && <div className="text-sm text-gray-700">Вы ещё ничего не взяли.</div>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Предложить предмет</h4>
        <div className="grid md:grid-cols-3 gap-2">
          <input className="input" placeholder="Название" value={name}
                 onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Ссылка на картинку (необязательно)" value={image}
                 onChange={(e) => setImage(e.target.value)} />
          <button className="btn-primary" onClick={propose}>Отправить на утверждение</button>
        </div>
        {message && <div className="text-sm mt-2">{message}</div>}
      </div>
    </div>
  );
}
