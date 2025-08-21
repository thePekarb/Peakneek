"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <>
      <header className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-white drop-shadow">Пикник</div>
        <div className="flex items-center gap-2">
          {email && <span className="text-white/90 text-sm">Вы вошли: {email}</span>}
          <button className="btn-ghost" onClick={() => setOpen(true)}>Профиль</button>
          <button className="btn-ghost" onClick={() => (location.href = "/admin")}>Админ-панель</button>
          <button className="btn-primary" onClick={logout}>Выйти</button>
        </div>
      </header>
      {open && <ProfileModal onClose={() => setOpen(false)} />}
    </>
  );
}
