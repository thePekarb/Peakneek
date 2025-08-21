"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthForms from "./AuthForms";
import Header from "./Header";
import MapBlock from "./MapBlock";
import Participants from "./Participants";
import EquipmentBlock from "./Equipment";
import ProductsBlock from "./Products";
import ShoppingListBlock from "./ShoppingList";

export default function ProtectedClient() {
const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

useEffect(() => {
supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
return () => { sub.subscription.unsubscribe(); };
}, []);

if (loggedIn === null) return <div className="text-white">Загрузка...</div>;
if (!loggedIn) return <AuthForms />;

return (
<div className="space-y-4">
<Header />
<MapBlock />
<Participants />
<EquipmentBlock />
<ProductsBlock />
<ShoppingListBlock />
</div>
);
}