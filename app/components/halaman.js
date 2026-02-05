"use client";
import { forwardRef } from "react";

const Halaman = forwardRef(({ number }, ref) => {
  return (
    <div className="bg-white shadow-inner" ref={ref}>
      <div className="h-full flex flex-col p-2">
        <div className="flex-1 bg-[#F9F9F9] flex items-center justify-center relative rounded-[1rem] p-0 overflow-hidden border-2  border-zinc-200">
          <img
            src={`/komik/pages/${number}.png`}
            alt={`Halaman ${number}`}
            className="w-full h-full object-cover shadow-sm"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {/* <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
            <span className="text-zinc-400 font-bold text-xs tracking-widest">
              PG {number}
            </span>
          </div> */}
        </div>
      </div>
    </div>
  );
});

Halaman.displayName = "Halaman";
export default Halaman;
