"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Equipment, Profile, ShoppingItem, ShoppingCheck } from "@/lib/types";

type Props = { onClose: () => void };

export default function ProfileModal({ onClose }: Props) {
  const [me, setMe] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [myEquip, setMyEquip] = useState<Equipment[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const load = async () => {
    const { data: userWrap } = await supabase.auth.getUser();
    const uid = userWrap.user?.id;
    if (!uid) return;

    const { data: p } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (p) {
      const prof = p as Profile;
      setMe(prof);
      setName(prof.full_name);
    }

    const { data: eq } = await supabase.from("equipment").select("*").eq("taken_by", uid);
    setMyEquip((eq ?? []) as Equipment[]);

    const { data: it } = await supabase.from("shopping_items").select("*").eq("approved", true);
    setItems((it ?? []) as ShoppingItem[]);

    const { data: ch } = await supabase.from("shopping_checks").select("item_id, checked").eq("user_id", uid);
    const map: Record<string, boolean> = {};
    (ch as Pick<ShoppingCheck, "item_id" | "checked">[] | null)?.forEach((c) => {
      map[c.item_id] = !!c.checked;
    });
    setChecks(map);
  };

  useEffect(() => { load(); }, []);

  const saveName = async () => {
  if (!me) return;
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", me.id);
  if (error) { alert(`Не удалось сохранить имя: ${error.message}`); return; }
  await load();
};

  const uploadAvatar = async () => {
  if (!me || !avatarFile) return;
  const ext = (avatarFile.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${me.id}.${ext}`;

  // обязательно укажите contentType
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type || "image/jpeg" });

  if (upErr) {
    alert(`Ошибка загрузки: ${upErr.message}`);
    return;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error: updErr } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", me.id);

  if (updErr) {
    alert(`Ошибка обновления профиля: ${updErr.message}`);
    return;
  }
  setAvatarFile(null);
  await load();
};

  const toggleCheck = async (itemId: string) => {
    if (!me) return;
    const newVal = !checks[itemId];
    setChecks((s) => ({ ...s, [itemId]: newVal }));
    if (newVal) {
      await supabase.from("shopping_checks").upsert({ user_id: me.id, item_id: itemId, checked: true });
    } else {
      await supabase.from("shopping_checks").delete().eq("user_id", me.id).eq("item_id", itemId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="container-glass p-4 max-w-3xl w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Профиль</h3>
          <button className="btn-ghost" onClick={onClose}>Закрыть</button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="container-glass p-3">
            <h4 className="font-semibold mb-2">Данные</h4>
            {me?.avatar_url && <img src={me.avatar_url} alt="" className="w-20 h-20 rounded-xl object-cover mb-2" />}
            <label className="label">ФИО</label>
            <input className="input" value={name} onChange={(e)=>setName(e.target.value)} />
            <button className="btn-ghost mt-2" onClick={saveName}>Сохранить имя</button>
            <div className="mt-3">
              <label className="label">Аватар</label>
              <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files?.[0] ?? null)} />
              <button className="btn-ghost mt-2" onClick={uploadAvatar} disabled={!avatarFile}>Загрузить</button>
            </div>
          </div>

          <div className="container-glass p-3">
            <h4 className="font-semibold mb-2">Моё снаряжение</h4>
            <div className="space-y-2">
              {myEquip.map(i=>(
                <div key={i.id} className="flex items-center gap-2">
                  {i.image_url && <img src={i.image_url} className="w-8 h-8 rounded-lg object-cover" alt="" />}
                  <div>{i.name}</div>
                </div>
              ))}
              {myEquip.length===0 && <div className="text-sm text-gray-700">Пока ничего не взято.</div>}
            </div>
          </div>
        </div>

        <div className="container-glass p-3 mt-4">
          <h4 className="font-semibold mb-2">Мои отметки по покупкам</h4>
          <div className="grid md:grid-cols-3 gap-2">
            {items.map(i=>(
              <label key={i.id} className="flex items-center gap-2 container-glass p-2">
                <input type="checkbox" checked={!!checks[i.id]} onChange={()=>toggleCheck(i.id)} />
                <span>{i.title}</span>
              </label>
            ))}
            {items.length===0 && <div className="text-sm text-gray-700">Список пока пуст.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
