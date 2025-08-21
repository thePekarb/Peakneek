"use client";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const Map = dynamic(() => import("./MapInner"), { ssr: false });

export default function MapBlock() {
const [loc, setLoc] = useState<{lat:number,lng:number} | null>(null);
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
(async () => {
const { data: { user } } = await supabase.auth.getUser();
if (user) {
const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
setIsAdmin(!!profile?.is_admin);
}
const { data } = await supabase.from("picnic_location").select("*").eq("id", 1).maybeSingle();
if (data?.lat && data?.lng) setLoc({lat: data.lat, lng: data.lng});
setLoading(false);
})();
}, []);

const onSet = async (lat:number, lng:number) => {
const { error } = await supabase.from("picnic_location").upsert({ id: 1, lat, lng }).select();
if (!error) setLoc({lat,lng});
};

if (loading) return <div className="card">Загрузка карты...</div>;

return (
<div className="card">
<h3 className="section-title">Место пикника</h3>
<p className="mb-2 text-sm text-gray-700">Нажмите на карту, чтобы выбрать место (только админ).</p>
<Map center={loc ?? {lat:55.751244, lng:37.618423}} onPick={isAdmin ? onSet : undefined} marker={loc ?? undefined} />
</div>
);
}