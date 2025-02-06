import { RepoList } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const saveToLocalStorage = (data: RepoList) => {
  localStorage.setItem("gitgroup-repository-list", JSON.stringify(data));
};

export const loadFromLocalStorage = () => {
  const data = localStorage.getItem("gitgroup-repository-list");
  return data ? JSON.parse(data) : null;
};

export const downloadJson = (data: RepoList, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
