"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForms() {
  const [tab, setTab] = useState<"user" | "admin">("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminNick, setAdminNick] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const signUp = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) setMessage(error.message);
    else setMessage("Регистрация создана. Теперь войдите.");
  };

  const signIn = async () => {
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else location.reload();
  };

  const signInAdmin = async () => {
    setMessage(null);
    if (adminNick !== "admin2904") { setMessage("Неверный ник админа."); return; }
    const adminEmail = "admin@picnic.local";
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
    if (error) setMessage(error.message);
    else location.href = "/admin";
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("user")} className={`btn-ghost ${tab==="user" ? "ring-2 ring-blue-500" : ""}`}>Пользователь</button>
        <button onClick={() => setTab("admin")} className={`btn-ghost ${tab==="admin" ? "ring-2 ring-blue-500" : ""}`}>Админ</button>
      </div>

      {tab === "user" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="section-title">Регистрация</h3>
            <label className="label">ФИО</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иванов Иван Иванович" />
            <label className="label mt-2">Почта</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <label className="label mt-2">Пароль</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button className="btn-primary mt-3 w-full" onClick={signUp}>Зарегистрироваться</button>
          </div>
          <div>
            <h3 className="section-title">Авторизация</h3>
            <label className="label">Почта</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <label className="label mt-2">Пароль</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <button className="btn-primary mt-3 w-full" onClick={signIn}>Войти</button>
          </div>
        </div>
      )}

      {tab === "admin" && (
        <div>
          <h3 className="section-title">Вход для админа</h3>
          <label className="label">Ник</label>
          <input className="input" value={adminNick} onChange={(e) => setAdminNick(e.target.value)} placeholder="admin" />
          <label className="label mt-2">Пароль</label>
          <input className="input" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} placeholder="12345" />
          <button className="btn-primary mt-3 w-full" onClick={signInAdmin}>Войти как админ</button>
        </div>
      )}

      {message && <div className="mt-3 text-sm text-red-700">{message}</div>}
    </div>
  );
}
