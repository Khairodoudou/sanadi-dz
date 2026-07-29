"use client";

export function PrintButton() {
  return (
    <button 
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }} 
      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
    >
      Imprimer / Sauvegarder en PDF
    </button>
  );
}
