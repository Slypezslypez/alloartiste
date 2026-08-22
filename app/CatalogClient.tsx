"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, isNewArrival } from "@/lib/categories";

type ArtistCard = {
  id: string;
  name: string;
  category: string;
  city: string;
  photos: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  createdAt: string; // ISO
};

type SortOption = "newest" | "alpha" | "rating";

export function CatalogClient({ artists }: { artists: ArtistCard[] }) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Toutes");
  const [category, setCategory] = useState("Tous");
  const [sort, setSort] = useState<SortOption>("newest");

  const allCategories = useMemo(() => {
    const custom = new Set(artists.map((a) => a.category).filter((c) => !CATEGORIES.includes(c as any)));
    return [...CATEGORIES, ...Array.from(custom).sort()];
  }, [artists]);

  const cities = useMemo(() => {
    const set = new Set(artists.map((a) => a.city).filter(Boolean));
    return ["Toutes", ...Array.from(set).sort()];
  }, [artists]);

  const filtered = useMemo(() => {
    return artists
      .filter((a) => {
        const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
        const matchesCity = city === "Toutes" || a.city === city;
        const matchesCategory = category === "Tous" || a.category === category;
        return matchesSearch && matchesCity && matchesCategory;
      })
      .sort((a, b) => {
        if (sort === "alpha") return a.name.localeCompare(b.name, "fr");
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [artists, search, city, category, sort]);

  function resetFilters() {
    setSearch("");
    setCity("Toutes");
    setCategory("Tous");
    setSort("newest");
  }

  const hasActiveFilters = search || city !== "Toutes" || category !== "Tous";

  return (
    <div id="catalogue">
      <h2 className="section-title">Le catalogue</h2>

      <div className="search-panel">
        <div
