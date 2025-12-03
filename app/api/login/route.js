import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

/**
 * POST /api/login
 * Request body: { email: string, password: string }
 * Response: JSON { success: boolean, message: string, user?: object }
 */

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // --- Basic validation ---
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // --- Load mock users from Firestore ---
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Assuming email is unique, we take the first match
    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data();

    // --- Validate password ---
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // --- Build response payload ---
    const { password: _, ...safeUser } = user; // omit password in response

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
