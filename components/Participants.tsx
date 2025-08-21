"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Profile, Equipment } from "@/lib/types";

function MemberModal({ user, onClose }: { user: Profile; onClose: () => void }) {
  const [equip, setEquip] = useState<Equipment[]>([]);
  useEffect(() => {
    (async ()=>{
      const { data } = await supabase.from("equipment").select("*").eq("taken_by", user.id);
      setEquip((data||[]) as Equipment[]);
    })();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="container-glass p-4 max-w-lg w-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Снаряжение: {user.full_name}</h3>
          <button className="btn-ghost" onClick={onClose}>Закрыть</button>
        </div>
        <div className="space-y-2">
          {equip.map(i=>(
            <div key={i.id} className="flex items-center gap-2">
              {i.image_url && <img src={i.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
              <div>{i.name}</div>
            </div>
          ))}
          {equip.length===0 && <div className="text-sm text-gray-700">Ничего не взято.</div>}
        </div>
      </div>
    </div>
  );
}

export default function Participants() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [openUser, setOpenUser] = useState<Profile | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    let my: Profile | null = null;
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) my = data as Profile;
      setMe(my);
    }
    const { data: list } = await supabase.from("profiles").select("*").eq("is_admin", false).order("created_at", { ascending: true });
    setProfiles((list||[]) as Profile[]);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (status: Profile['status']) => {
    if (!me) return;
    const { error } = await supabase.from("profiles").update({ status }).eq("id", me.id);
    if (!error) await load();
  };

  const badge = (s: Profile['status']) => ({ going: "bg-green-600", not_going: "bg-red-600", undecided: "bg-gray-500" }[s]);

  return (
    <div className="card">
      <h3 className="section-title">Участники похода</h3>
      <div className="flex gap-2 mb-3">
        <button className="btn-ghost" onClick={()=>setStatus('going')}>Иду</button>
        <button className="btn-ghost" onClick={()=>setStatus('not_going')}>Не иду</button>
        <button className="btn-ghost" onClick={()=>setStatus('undecided')}>Подумаю</button>
      </div>
      <div className="grid-3">
        {profiles.map(p => (
          <button key={p.id} className="p-3 container-glass text-left" onClick={()=>setOpenUser(p)}>
            <div className="font-medium">{p.full_name}</div>
            <div className={`text-white inline-block mt-2 px-2 py-1 rounded ${badge(p.status)}`}>
              {p.status === 'going' ? 'Идет' : p.status === 'not_going' ? 'Не идет' : 'Не решил'}
            </div>
          </button>
        ))}
      </div>
      {openUser && <MemberModal user={openUser} onClose={()=>setOpenUser(null)} />}
    </div>
  );
}
