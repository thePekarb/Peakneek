'use client';
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Equipment, Product, ShoppingItem, PicnicLocation } from "@/lib/types";
import { parseDMS } from "@/lib/utils";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [equipPending, setEquipPending] = useState<Equipment[]>([]);
  const [productsVoting, setProductsVoting] = useState<Product[]>([]);
  const [shopPending, setShopPending] = useState<ShoppingItem[]>([]);
  const [loc, setLoc] = useState<PicnicLocation | null>(null);
  const [dms, setDms] = useState("");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAdmin(false); return; }
    const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle(); 
    setIsAdmin(!!prof?.is_admin);
    if (!prof?.is_admin) return;

    const { data: eq } = await supabase.from("equipment").select("*").eq("approved", false).order("created_at");
    setEquipPending((eq||[]) as Equipment[]);
    const { data: pr } = await supabase.from("products_view_with_votes").select("*").eq("status", "voting").order("votes", { ascending:false });
    setProductsVoting((pr||[]) as Product[]);
    const { data: sh } = await supabase.from("shopping_items").select("*").eq("approved", false).order("created_at");
    setShopPending((sh||[]) as ShoppingItem[]);
    const { data: lo } = await supabase.from("picnic_location").select("*").eq("id",1).maybeSingle();
    setLoc((lo||null) as PicnicLocation | null);
  };
  useEffect(() => { load(); }, []);

  const approveEquip = async (id:string, ok:boolean) => {
    if (ok) await supabase.from("equipment").update({ approved: true }).eq("id", id);
    else await supabase.from("equipment").delete().eq("id", id);
    await load();
  };
  const setProductStatus = async (id:string, status:'approved'|'rejected') => {
    await supabase.from("products").update({ status, approved_at: status==='approved' ? new Date().toISOString() : null }).eq("id", id);
    await load();
  };
  const approveShop = async (id:string, priority:'low'|'medium'|'high'|'reject') => {
    if (priority==='reject') await supabase.from("shopping_items").delete().eq("id", id);
    else await supabase.from("shopping_items").update({ approved: true, priority }).eq("id", id);
    await load();
  };

  const saveLoc = async () => {
    if (!loc) return;
    await supabase.from("picnic_location").upsert({ id: 1, lat: loc.lat, lng: loc.lng });
    await load();
  };
  const saveDms = async () => {
    const parsed = parseDMS(dms);
    if (!parsed) return alert("Не удалось распознать координаты. Пример: 48°51'46.0\"N 43°36'19.1\"E");
    await supabase.from("picnic_location").upsert({ id: 1, lat: parsed.lat, lng: parsed.lng });
    setDms("");
    await load();
  };

  if (isAdmin === null) return <div className="p-4 text-white">Загрузка...</div>;
  if (!isAdmin) return <div className="p-4 text-white">Доступ запрещен. Войдите как админ.</div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold text-white">Админ-панель</h1>

      <section className="card">
        <h2 className="section-title">Снаряжение — модерация</h2>
        <div className="space-y-2">
          {equipPending.map((i: Equipment) => (
            <div className="flex items-center gap-3 container-glass p-3" key={i.id}>
              {i.image_url && <img src={i.image_url} alt="" className="w-12 h-12 object-cover rounded-xl" />}
              <div className="flex-1"><div className="font-medium">{i.name}</div></div>
              <button className="btn-ghost" onClick={()=>approveEquip(i.id,true)}>Утвердить</button>
              <button className="btn-ghost" onClick={()=>approveEquip(i.id,false)}>Отклонить</button>
            </div>
          ))}
          {equipPending.length===0 && <div className="text-sm text-gray-700">Нет заявок.</div>}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Меню — голосования</h2>
        <div className="space-y-2">
          {productsVoting.map((p: Product) => (
            <div key={p.id} className="container-glass p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{p.name} {p.is_lenten ? "(постное)" : ""} — Голоса: {p.votes ?? 0}</div>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={()=>setProductStatus(p.id,'approved')}>Утвердить</button>
                  <button className="btn-ghost" onClick={()=>setProductStatus(p.id,'rejected')}>Отменить</button>
                </div>
              </div>
              {p.description && <div className="text-sm text-gray-700 mt-1">{p.description}</div>}
            </div>
          ))}
          {productsVoting.length===0 && <div className="text-sm text-gray-700">Нет активных голосований.</div>}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Покупки — модерация</h2>
        <div className="space-y-2">
          {shopPending.map((i: ShoppingItem) => (
            <div key={i.id} className="container-glass p-3">
              <div className="font-medium">{i.title}</div>
              {i.note && <div className="text-sm text-gray-700">{i.note}</div>}
              <div className="flex gap-2 mt-2">
                <button className="btn-ghost" onClick={()=>approveShop(i.id,'high')}>Высокий</button>
                <button className="btn-ghost" onClick={()=>approveShop(i.id,'medium')}>Средний</button>
                <button className="btn-ghost" onClick={()=>approveShop(i.id,'low')}>Низкий</button>
                <button className="btn-ghost" onClick={()=>approveShop(i.id,'reject')}>Удалить</button>
              </div>
            </div>
          ))}
          {shopPending.length===0 && <div className="text-sm text-gray-700">Нет заявок.</div>}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Локация</h2>
        <div className="grid md:grid-cols-3 gap-2">
          <input className="input" type="number" step="0.000001" placeholder="Широта" value={loc?.lat ?? ''} onChange={(e)=>setLoc(v=>({...(v||{id:1, lat:0, lng:0, updated_by:null, updated_at:null}), lat: parseFloat(e.target.value)}))} />
          <input className="input" type="number" step="0.000001" placeholder="Долгота" value={loc?.lng ?? ''} onChange={(e)=>setLoc(v=>({...(v||{id:1, lat:0, lng:0, updated_by:null, updated_at:null}), lng: parseFloat(e.target.value)}))} />
          <button className="btn-primary" onClick={saveLoc}>Сохранить</button>
        </div>
        <div className="grid md:grid-cols-3 gap-2 mt-2">
          <input
  className="input md:col-span-2"
  placeholder={`48°51'46.0"N 43°36'19.1"E`}
  value={dms}
  onChange={(e)=>setDms(e.target.value)}
/>
          <button className="btn-ghost" onClick={saveDms}>Ввести DMS</button>
        </div>
      </section>
    </div>
  );
}
