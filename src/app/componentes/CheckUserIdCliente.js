'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckUserIdClient({ userId }) {
    const router = useRouter();

    useEffect(() => {
        const localUserId = localStorage.getItem("user_id");
        if (!localUserId || localUserId !== userId) {
            router.push("/");
        }
    }, [userId, router]);

    return null;
}
