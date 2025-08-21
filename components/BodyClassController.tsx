"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // используем ОДИН экземпляр

/**
 * Вешает на <body> класс:
 *  - auth-page    — на страницах авторизации
 *  - profile-page — для любого авторизованного пользователя (на любых страницах)
 */
export default function BodyClassController() {
  const pathname = usePathname();

  useEffect(() => {
    let canceled = false;

    async function run() {
      // Снимаем наши классы каждый раз
      document.body.classList.remove("auth-page", "profile-page");

      // Если это страница логина/регистрации — фон авторизации
      if (pathname?.startsWith("/auth") || pathname === "/login") {
        document.body.classList.add("auth-page");
        return;
      }

      // Иначе, если пользователь залогинен — фон профиля
      const { data } = await supabase.auth.getUser();
      if (!canceled && data.user) {
        document.body.classList.add("profile-page");
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [pathname]);

  return null;
}
