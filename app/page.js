"use client";
import { useState, useRef, forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import Halaman from "./components/halaman";

export default function Home() {
  const [step, setStep] = useState("cover");
  const [nama, setNama] = useState("");
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const totalHalaman = 69;

  const choiceData = {
    4: {
      a: { text: "Nasi Uduk & Ayam", p: 15 },
      b: { text: "Roti Telur & Susu", p: 25 },
      next: 5,
    },
    9: {
      a: { text: "Es Boba Manis", p: 10 },
      b: { text: "Air Putih Segar", p: 20 },
      next: 10,
    },
    // ... data pilihan lainnya tetap sama ...
  };

  const saveScore = async () => {
    setLoading(true);
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, skor: score }),
      });
      fetchLeaderboard();
      setStep("leaderboard");
      alert('Berhasil Menyimpan');
    } catch (err) {
      console.error("Gagal simpan skor:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  const jumpTo = (pageNum) => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flip(pageNum - 1);
      setCurrentPage(pageNum);
    }
  };

  const handleChoice = (points, next) => {
    setScore((prev) => prev + points);
    jumpTo(next);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-[#FFF9F0] font-sans text-zinc-800  select-none overflow-hidden">
      {/* --- FLOATING STATUS (TOP) --- */}
      {step === "comic" && (
        <div className="w-full px-6 pt-6 pb-2 flex justify-between items-center z-50">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-[#FFD93D] flex items-center gap-2">
            <span className="text-xl">👤</span>
            <span className="font-black text-sm text-zinc-600 truncate max-w-[80px]">
              {nama}
            </span>
          </div>
          <div className="bg-[#FF8B8B] px-5 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-2 animate-bounce-short">
            <span className="text-white font-black text-lg">{score}</span>
            <span className="text-white/80 text-[10px] font-bold uppercase">
              Points
            </span>
          </div>
        </div>
      )}

      {/* 1. COVER (SUPER CUTE) */}
      {step === "cover" && (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="text-[120px] relative drop-shadow-xl leading-none">
              🍱
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 text-[#4D4D4D] leading-none uppercase italic">
            Misi <br />{" "}
            <span className="text-[#FF6B6B] text-5xl">Makan Sehat</span>
          </h1>
          <p className="text-zinc-400 font-bold mb-10 text-sm tracking-wide">
            Petualangan nutrisi yang seru!
          </p>
          <button
            onClick={() => setStep("input")}
            className="group relative bg-[#6BCB77] hover:bg-[#59b865] text-white px-12 py-5 rounded-[2.5rem] font-black text-xl shadow-[0_8px_0_#48a353] transition-all active:translate-y-1 active:shadow-none"
          >
            MULAI SEKARANG!
          </button>
        </div>
      )}

      {/* 2. INPUT NAMA */}
      {step === "input" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-10">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full border-4 border-[#FFD93D] relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl bg-white rounded-full p-2 shadow-md">
              👋
            </div>
            <h2 className="text-2xl font-black mb-6 mt-4 text-center">
              Kenalan Yuk!
            </h2>
            <input
              type="text"
              className="w-full p-5 bg-[#FDFCF0] border-3 border-zinc-100 rounded-[2rem] mb-6 text-center text-xl font-black text-indigo-500 placeholder:text-zinc-300 outline-none focus:border-indigo-300 transition-all"
              placeholder="Nama Kamu..."
              onChange={(e) => setNama(e.target.value)}
            />
            <button
              disabled={!nama}
              onClick={() => setStep("comic")}
              className="w-full bg-[#4D96FF] text-white py-5 rounded-[2rem] font-black text-lg shadow-[0_6px_0_#3678db] disabled:opacity-30 disabled:shadow-none transition-all active:translate-y-1 active:shadow-none"
            >
              GASSS! 🚀
            </button>
          </div>
        </div>
      )}

      {/* 3. MODE KOMIK (STRETCHED FOR MOBILE) */}
      {step === "comic" && (
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 p-0">
          {/* AREA BUKU - Disesuaikan agar pas di layar HP */}
          <div className="w-full p-20 flex-1 max-h-[60vh] flex items-center justify-center">
            <HTMLFlipBook
              width={300}
              height={450}
              size="stretch"
              minWidth={280}
              maxWidth={500}
              minHeight={100}
              maxHeight={700}
              showCover={false}
              onFlip={(e) => setCurrentPage(e.data + 1)}
              ref={bookRef}
              className="comic-book shadow-2xl rounded-[2rem]"
              mobileScrollSupport={true}
            >
              {[...Array(totalHalaman)].map((_, i) => (
                <Halaman key={i + 1} number={i + 1} />
              ))}
            </HTMLFlipBook>
          </div>
          {/* --- INTERACTIVE DECK (BOTTOM) --- */}
          <div className="w-full max-w-[600px] z-10 px-2">
            {choiceData[currentPage] ? (
              <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border-t-4 border-zinc-50 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
                <div className="text-center font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-1">
                  Pilih Salah Satu
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() =>
                      handleChoice(
                        choiceData[currentPage].a.p,
                        choiceData[currentPage].next,
                      )
                    }
                    className="flex items-center gap-4 p-4 bg-[#F0F7FF] border-2 border-[#D6E9FF] rounded-3xl hover:border-indigo-400 active:scale-95 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200">
                      A
                    </div>
                    <span className="flex-1 text-left font-bold text-zinc-700 text-sm leading-tight">
                      {choiceData[currentPage].a.text}
                    </span>
                    {/* <span className="text-indigo-400 font-black text-xs">
                      +{choiceData[currentPage].a.p}
                    </span> */}
                  </button>

                  <button
                    onClick={() =>
                      handleChoice(
                        choiceData[currentPage].b.p,
                        choiceData[currentPage].next,
                      )
                    }
                    className="flex items-center gap-4 p-4 bg-[#F0FFF4] border-2 border-[#D6FFE0] rounded-3xl hover:border-emerald-400 active:scale-95 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-200">
                      B
                    </div>
                    <span className="flex-1 text-left font-bold text-zinc-700 text-sm leading-tight">
                      {choiceData[currentPage].b.text}
                    </span>
                    {/* <span className="text-emerald-400 font-black text-xs">
                      +{choiceData[currentPage].b.p}
                    </span> */}
                  </button>
                </div>
              </div>
            ) : (
              <div className=" flex items-center justify-center">
                {currentPage === totalHalaman && (
                  <button
                    onClick={saveScore}
                    className="w-full bg-[#FF6B6B] text-white py-4 rounded-2xl font-black text-lg shadow-[0_5px_0_#d95252] active:translate-y-1 active:shadow-none"
                  >
                    {loading ? "MENYIMPAN..." : "🏁 SELESAI & SIMPAN"}!
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === "leaderboard" && (
        <div className="flex flex-col items-center justify-center h-full w-full px-8 animate-in zoom-in duration-500">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border-4 border-[#FFD93D] flex flex-col max-h-[80vh]">
            <div className="p-6 bg-[#FFD93D] text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                🏆 10 Terbaik 🏆
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {leaderboard.map((item, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-4 rounded-2xl border-2 ${i === 0 ? "bg-yellow-50 border-yellow-200 animate-pulse" : "bg-zinc-50 border-transparent"}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? "bg-yellow-400 text-white" : "bg-zinc-200 text-zinc-500"}`}
                    >
                      {i + 1}
                    </span>
                    <span className="font-bold text-zinc-700 capitalize">
                      {item.nama}
                    </span>
                  </div>
                  <span className="font-black text-[#4D96FF]">{item.skor}</span>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-zinc-100">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-zinc-800 text-white rounded-[1.5rem] font-black text-sm uppercase"
              >
                Main Lagi 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS KHUSUS ANIMASI */}
      <style jsx global>{`
        @keyframes bounce-short {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
        .comic-book {
          background: white;
        }
      `}</style>
    </div>
  );
}
