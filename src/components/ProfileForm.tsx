"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Upload, KeyRound } from "lucide-react";
import { useToast } from "./Toast";
import { Avatar } from "./Avatar";

interface Me {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatarUrl?: string;
  rollNumber?: string;
  department?: string;
  bio?: string;
}

export function ProfileForm({ me }: { me: Me }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [name, setName] = useState(me.name);
  const [department, setDepartment] = useState(me.department || "");
  const [rollNumber, setRollNumber] = useState(me.rollNumber || "");
  const [bio, setBio] = useState(me.bio || "");
  const [busy, setBusy] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    fd.append("name", name);
    fd.append("department", department);
    fd.append("rollNumber", rollNumber);
    fd.append("bio", bio);
    if (avatar) fd.append("avatar", avatar);
    try {
      const res = await fetch("/api/profile", { method: "PATCH", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.push("Profile updated", "success");
      setAvatar(null);
      router.refresh();
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwBusy(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.push("Password updated", "success");
      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      toast.push(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <form onSubmit={saveProfile} className="card space-y-4">
        <h2 className="font-serif text-xl font-semibold text-[color:var(--color-ink)]">
          Profile information
        </h2>

        <div className="flex items-center gap-4">
          <Avatar
            name={name}
            src={avatar ? URL.createObjectURL(avatar) : me.avatarUrl}
            size={64}
          />
          <div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} /> Change photo
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-[color:var(--color-ink-400)] mt-1">
              PNG, JPG up to 5 MB
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={me.email} disabled />
          </div>
          {me.role === "student" && (
            <div>
              <label className="label">Roll number</label>
              <input
                className="input"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="label">Department</label>
            <input
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Short bio</label>
          <textarea
            className="input min-h-[90px] resize-y"
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others a little about yourself..."
          />
        </div>

        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? <Loader2 className="spin-slow" size={14} /> : <Save size={14} />}
          {busy ? "Saving..." : "Save profile"}
        </button>
      </form>

      <form onSubmit={changePassword} className="card space-y-3 h-fit">
        <h2 className="font-serif text-xl font-semibold text-[color:var(--color-ink)]">
          Change password
        </h2>
        <div>
          <label className="label">Current password</label>
          <input
            type="password"
            required
            className="input"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
          />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            required
            className="input"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
        </div>
        <button type="submit" disabled={pwBusy} className="btn btn-primary w-full">
          {pwBusy ? <Loader2 className="spin-slow" size={14} /> : <KeyRound size={14} />}
          {pwBusy ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
