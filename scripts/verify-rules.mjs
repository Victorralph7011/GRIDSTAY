/**
 * One-off manual verification that the new security-rule constraints
 * actually reject what they should. Not a permanent test file — run
 * once after a rules change that touches these paths, then delete.
 */
import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

async function expectDenied(label, fn) {
  try {
    await fn();
    console.log(`FAIL (should have been denied): ${label}`);
  } catch (err) {
    if (err.code === "permission-denied") {
      console.log(`OK (correctly denied): ${label}`);
    } else {
      console.log(`FAIL (wrong error for): ${label} ->`, err.code, err.message);
    }
  }
}

async function main() {
  const cred = await signInWithEmailAndPassword(
    auth,
    "seed.provider@gridstay.dev",
    env.SEED_PROVIDER_PASSWORD
  );
  const uid = cred.user.uid;

  await expectDenied("student/provider self-promoting role field", () =>
    updateDoc(doc(db, "users", uid), { role: "provider-but-actually-hacked" })
  );

  // Grab one of this provider's own properties to attempt
  // self-verification / ownership-reassignment on.
  const ownProps = await getDocs(
    query(collection(db, "properties"), where("providerId", "==", uid), limit(1))
  );
  if (ownProps.empty) {
    console.log("No properties owned by the seed provider — run scripts/seed.mjs first.");
    process.exit(0);
  }
  const propId = ownProps.docs[0].id;
  const currentlyVerified = ownProps.docs[0].data().verified;

  await expectDenied(
    `provider flipping their own listing's verified (${currentlyVerified} -> ${!currentlyVerified})`,
    () => updateDoc(doc(db, "properties", propId), { verified: !currentlyVerified })
  );

  await expectDenied("provider reassigning property ownership", () =>
    updateDoc(doc(db, "properties", propId), { providerId: "someone-else" })
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("verify-rules crashed:", err);
  process.exit(1);
});
