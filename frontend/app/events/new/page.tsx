"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventsService } from "@/lib/services/events";
import { EventCategory } from "@/types";
import { useAuth } from "@/context/AuthContext";

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "CONCERT", label: "Concert" },
  { value: "THEATRE", label: "Théâtre" },
  { value: "CONFERENCE", label: "Conférence" },
  { value: "SPORT", label: "Sport" },
  { value: "FESTIVAL", label: "Festival" },
  { value: "OTHER", label: "Autre" },
];

const INPUT_CLASS =
  "w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400";

const LABEL_CLASS =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

export default function NewEventPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    totalSeats: "",
    price: "",
    category: "OTHER" as EventCategory,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && !hasRole("ORGANIZER", "ADMIN")) {
    router.push("/events");
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const created = await eventsService.create({
        title: form.title,
        description: form.description || undefined,
        eventDate: new Date(form.eventDate).toISOString().slice(0, 19),
        location: form.location,
        totalSeats: Number(form.totalSeats),
        price: Number(form.price),
        category: form.category,
      });
      if (imageFile && created.data?.id) {
        await eventsService.uploadImage(created.data.id, imageFile);
      }
      router.push("/dashboard/organizer");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard/organizer"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
        >
          ← Retour au dashboard
        </Link>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
            Créer un événement
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            L&apos;événement sera créé en brouillon. Publiez-le depuis votre dashboard.
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={LABEL_CLASS}>Titre *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={set("title")}
                className={INPUT_CLASS}
                placeholder="Ex: Concert de Jazz au Palais"
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={set("description")}
                className={INPUT_CLASS}
                placeholder="Décrivez votre événement…"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Date et heure *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.eventDate}
                  onChange={set("eventDate")}
                  className={INPUT_CLASS}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Lieu *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={set("location")}
                  className={INPUT_CLASS}
                  placeholder="Ex: Salle Pleyel, Paris"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={LABEL_CLASS}>Nombre de places *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.totalSeats}
                  onChange={set("totalSeats")}
                  className={INPUT_CLASS}
                  placeholder="500"
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Prix (€) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                  className={INPUT_CLASS}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Catégorie</label>
                <select
                  value={form.category}
                  onChange={set("category")}
                  className={INPUT_CLASS}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Image de l&apos;événement</label>
              <div
                className="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 px-6 py-8 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                onClick={() => document.getElementById("event-image-input")?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="max-h-48 rounded-lg object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-2xl mb-2">🖼️</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Cliquez pour choisir une image</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, WEBP — max 10 Mo</p>
                  </div>
                )}
                <input
                  id="event-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  Supprimer l&apos;image
                </button>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
              >
                {loading ? "Création…" : "Créer l'événement"}
              </button>
              <Link
                href="/dashboard/organizer"
                className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
